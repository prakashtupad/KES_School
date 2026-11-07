const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      enum: ['hero_carousel', 'about_us', 'campus_life'],
      required: [
        true,
        'Content section (hero_carousel, about_us, or campus_life) is required',
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    secondaryDescription: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      default: 'Guided by Moral Values & Community Excellence',
    },
    primaryButtonText: {
      type: String,
      trim: true,
      default: 'Enquire for 2026-27',
    },
    primaryButtonLink: {
      type: String,
      trim: true,
      default: '#enquiry',
    },
    secondaryButtonText: {
      type: String,
      trim: true,
      default: 'Learn Our Story',
    },
    secondaryButtonLink: {
      type: String,
      trim: true,
      default: '#about',
    },
    // About Us Specific Pillar & Governance Fields
    pillar1Title: {
      type: String,
      trim: true,
      default: 'Our Approved Vision',
    },
    pillar1Description: {
      type: String,
      trim: true,
      default:
        'To empower every child with foundational literacy, communicative confidence, and character to grow into responsible citizens.',
    },
    pillar2Title: {
      type: String,
      trim: true,
      default: 'Our Learning Approach',
    },
    pillar2Description: {
      type: String,
      trim: true,
      default:
        'Child-centric teaching, interactive language development, continuous assessment, and close collaboration with parents.',
    },
    governanceTitle: {
      type: String,
      trim: true,
      default: 'Khanatti Education Society Governance',
    },
    governanceSubtitle: {
      type: String,
      trim: true,
      default:
        'Management, Head of School & Faculty details available upon confirmation.',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

siteContentSchema.index({ section: 1, isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('SiteContent', siteContentSchema);
