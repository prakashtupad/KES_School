const mongoose = require('mongoose');
const SiteContent = require('../models/SiteContent');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const { DEFAULT_SITE_CONTENT } = require('../scripts/seedSiteContent');

const ALLOWED_SECTIONS = ['hero_carousel', 'about_us', 'campus_life'];
let hasCheckedAutoSeed = false;

async function ensureSeededIfEmpty() {
  if (hasCheckedAutoSeed) return;
  const dbStatus = getDbStatus();
  if (!dbStatus.isConnected) return;

  try {
    for (const sec of ALLOWED_SECTIONS) {
      const count = await SiteContent.countDocuments({ section: sec });
      if (count === 0) {
        const itemsForSec = DEFAULT_SITE_CONTENT.filter((i) => i.section === sec).map(
          ({ _id, ...rest }) => rest
        );
        if (itemsForSec.length > 0) {
          await SiteContent.insertMany(itemsForSec);
          console.log(`[SiteContent] Auto-seeded ${itemsForSec.length} default items for "${sec}".`);
        }
      }
    }
    hasCheckedAutoSeed = true;
  } catch (err) {
    console.error('[SiteContent Auto-Seed Error]', err.message);
  }
}

/**
 * GET /api/v1/content?section=hero_carousel|about_us|campus_life
 * Publicly accessible endpoint to fetch active website CMS content.
 */
exports.getSiteContent = async (req, res) => {
  try {
    const { section, includeInactive } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      await ensureSeededIfEmpty();

      const filter = {};
      if (section && ALLOWED_SECTIONS.includes(section)) {
        filter.section = section;
      }
      if (includeInactive !== 'true') {
        filter.isActive = true;
      }

      const items = await SiteContent.find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: items.length,
        data: items,
        items,
      });
    }

    // MemoryStore fallback
    let results = [...(memoryStore.siteContent || [])];
    if (section && ALLOWED_SECTIONS.includes(section)) {
      results = results.filter((item) => item.section === section);
    }
    if (includeInactive !== 'true') {
      results = results.filter((item) => item.isActive !== false);
    }

    results.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      items: results,
    });
  } catch (error) {
    console.error('[SiteContentController getSiteContent Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load website content.',
      message: 'Failed to load website content.',
    });
  }
};

/**
 * POST /api/v1/content
 * Admin only: Create a new Hero Carousel slide, About Us block, or Campus Life card.
 */
exports.createSiteContent = async (req, res) => {
  try {
    const {
      section,
      title,
      subtitle = '',
      description,
      secondaryDescription = '',
      imageUrl,
      caption = '',
      primaryButtonText = 'Enquire for 2026–27',
      primaryButtonLink = '#enquiry',
      secondaryButtonText = '',
      secondaryButtonLink = '',
      pillar1Title = 'Our Approved Vision',
      pillar1Description = '',
      pillar2Title = 'Our Learning Approach',
      pillar2Description = '',
      governanceTitle = 'Khanatti Education Society Governance',
      governanceSubtitle = '',
      displayOrder = 0,
      isActive = true,
    } = req.body || {};

    if (!section || !ALLOWED_SECTIONS.includes(section)) {
      return res.status(400).json({
        success: false,
        error: 'Valid section (hero_carousel, about_us, or campus_life) is required.',
        message: 'Valid section (hero_carousel, about_us, or campus_life) is required.',
      });
    }

    if (!title || !description || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Title, Description, and Image URL are required.',
        message: 'Title, Description, and Image URL are required.',
      });
    }

    const payload = {
      section,
      title: String(title).trim(),
      subtitle: String(subtitle || '').trim(),
      description: String(description).trim(),
      secondaryDescription: String(secondaryDescription || '').trim(),
      imageUrl: String(imageUrl).trim(),
      caption: String(caption || '').trim(),
      primaryButtonText: String(primaryButtonText || '').trim(),
      primaryButtonLink: String(primaryButtonLink || '#enquiry').trim(),
      secondaryButtonText: String(secondaryButtonText || '').trim(),
      secondaryButtonLink: String(secondaryButtonLink || '').trim(),
      pillar1Title: String(pillar1Title || '').trim(),
      pillar1Description: String(pillar1Description || '').trim(),
      pillar2Title: String(pillar2Title || '').trim(),
      pillar2Description: String(pillar2Description || '').trim(),
      governanceTitle: String(governanceTitle || '').trim(),
      governanceSubtitle: String(governanceSubtitle || '').trim(),
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== false,
    };

    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const created = await SiteContent.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Website content item created successfully.',
        data: created,
        item: created,
      });
    }

    const newMemItem = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.siteContent.push(newMemItem);

    return res.status(201).json({
      success: true,
      message: 'Website content item created successfully.',
      data: newMemItem,
      item: newMemItem,
    });
  } catch (error) {
    console.error('[SiteContentController createSiteContent Error]', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to create content item.',
      message: error.message || 'Failed to create content item.',
    });
  }
};

/**
 * PUT /api/v1/content/:id
 * Admin only: Update an existing Hero Carousel slide, About Us block, or Campus Life card.
 */
exports.updateSiteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.displayOrder !== undefined) {
      updates.displayOrder = Number(updates.displayOrder) || 0;
    }

    const dbStatus = getDbStatus();

    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await SiteContent.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (updated) {
        return res.status(200).json({
          success: true,
          message: 'Website content updated successfully.',
          data: updated,
          item: updated,
        });
      }
    }

    // MemoryStore fallback
    const memItem = (memoryStore.siteContent || []).find(
      (item) => String(item._id) === String(id)
    );
    if (!memItem) {
      return res.status(404).json({
        success: false,
        error: 'Content item not found.',
        message: 'Content item not found.',
      });
    }

    Object.assign(memItem, updates, { updatedAt: new Date() });

    return res.status(200).json({
      success: true,
      message: 'Website content updated successfully.',
      data: memItem,
      item: memItem,
    });
  } catch (error) {
    console.error('[SiteContentController updateSiteContent Error]', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to update content item.',
      message: error.message || 'Failed to update content item.',
    });
  }
};

/**
 * DELETE /api/v1/content/:id
 * Admin only: Delete a Hero Carousel slide, About Us item, or Campus Life card.
 */
exports.deleteSiteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await SiteContent.findByIdAndDelete(id);
    }

    const idx = (memoryStore.siteContent || []).findIndex(
      (item) => String(item._id) === String(id)
    );
    if (idx !== -1) {
      memoryStore.siteContent.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Content item deleted successfully.',
    });
  } catch (error) {
    console.error('[SiteContentController deleteSiteContent Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete content item.',
      message: 'Failed to delete content item.',
    });
  }
};
