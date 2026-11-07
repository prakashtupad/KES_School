require('dotenv').config();
const mongoose = require('mongoose');
const SiteContent = require('../models/SiteContent');
const { connectDB } = require('../config/db');

const DEFAULT_SITE_CONTENT = [
  // ================= HERO CAROUSEL SLIDES =================
  {
    _id: '672700000000000000000401',
    section: 'hero_carousel',
    subtitle: 'WELCOME TO KHANATTI',
    title: 'Inspiring with Values & Quality Education',
    description:
      'Rooted in Khanatti under the guidance of Khanatti Education Society, nurturing curious, disciplined, and compassionate learners for a bright future.',
    caption: 'Guided by Moral Values & Community Excellence',
    imageUrl: '/images/governance-campus.jpg',
    primaryButtonText: 'Enquire for 2026–27',
    primaryButtonLink: '#enquiry',
    secondaryButtonText: 'Learn Our Story',
    secondaryButtonLink: '#about',
    displayOrder: 1,
    isActive: true,
  },
  {
    _id: '672700000000000000000402',
    section: 'hero_carousel',
    subtitle: 'ACADEMIC PATHWAY',
    title: 'Structured Learning for Classes: Nursery | LKG | UKG & Primary Classes',
    description:
      'Following verified curriculum guidelines under Recognised by Govt. of Karnataka (KSEAB), helping each child develop foundational mastery and language fluency.',
    caption: 'Interactive Classroom Learning at Khanatti',
    imageUrl: '/images/interactive-classroom.jpg',
    primaryButtonText: 'Enquire About Admission',
    primaryButtonLink: '#enquiry',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    displayOrder: 2,
    isActive: true,
  },
  {
    _id: '672700000000000000000403',
    section: 'hero_carousel',
    subtitle: 'NURTURING ATMOSPHERE',
    title: 'A Safe, Supportive Campus for Every Rural & Town Child',
    description:
      'Dedicated educators, caring classroom culture, and regular student activities focused on moral values and holistic growth in Khanatti.',
    caption: 'Joyful, Child-Centric Campus Environment',
    imageUrl: '/images/campus-joy.jpg',
    primaryButtonText: 'View Campus Life',
    primaryButtonLink: '#campus-life',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    displayOrder: 3,
    isActive: true,
  },
  {
    _id: '672700000000000000000404',
    section: 'hero_carousel',
    subtitle: 'ADMISSIONS & ENQUIRIES',
    title: 'Admissions Open for New Session 2026–27',
    description:
      'Simple enquiry process for parents and guardians. Submit your interest online and our school admissions desk will assist you directly.',
    caption: 'Admissions Open for 2026–27',
    imageUrl: '/images/morning-assembly.jpg',
    primaryButtonText: 'Fill Admission Form',
    primaryButtonLink: '#enquiry',
    secondaryButtonText: 'Office & Map Info',
    secondaryButtonLink: '#contact',
    displayOrder: 4,
    isActive: true,
  },

  // ================= ABOUT US SECTION =================
  {
    _id: '672700000000000000000408',
    section: 'about_us',
    subtitle: 'Welcome to Our School',
    title: 'Khanatti Education Society’s Shri Siddharoodha English Medium School',
    description:
      'Established under the patronage of Khanatti Education Society in Khanatti, our institution is committed to bringing accessible, disciplined, and nurturing English medium education to children of the local community.',
    secondaryDescription:
      'Our campus provides an atmosphere of mutual respect, cultural grounding, and moral integrity inspired by the teachings of Sadguru Shri Siddharoodha Swamiji.',
    imageUrl: '/images/governance-campus.jpg?v=2',
    caption: 'Shri Siddharoodha English Medium School Campus & Assembly Ground',
    pillar1Title: 'Our Approved Vision',
    pillar1Description:
      'To empower every child with foundational literacy, communicative confidence, and character to grow into responsible citizens.',
    pillar2Title: 'Our Learning Approach',
    pillar2Description:
      'Child-centric teaching, interactive language development, continuous assessment, and close collaboration with parents.',
    governanceTitle: 'Khanatti Education Society Governance',
    governanceSubtitle:
      'Management, Head of School & Faculty details available upon confirmation.',
    displayOrder: 1,
    isActive: true,
  },

  // ================= STUDENT & CAMPUS LIFE CARDS =================
  {
    _id: '672700000000000000000411',
    section: 'campus_life',
    subtitle: 'School Infrastructure',
    title: 'School Building & Play Area',
    description:
      "Modern, well-ventilated school building in Khanatti with a dedicated children's outdoor play park.",
    caption: 'KES Khanatti',
    imageUrl: '/images/interactive-classroom.jpg?v=2',
    displayOrder: 1,
    isActive: true,
  },
  {
    _id: '672700000000000000000412',
    section: 'campus_life',
    subtitle: 'KES Khanatti Campus',
    title: 'Main Campus Entrance & Fountain',
    description:
      "Welcoming entrance arch of Khanatti Education Society's Shri Siddharoodha English Medium School.",
    caption: 'KES Khanatti',
    imageUrl: '/images/campus-entrance.jpg?v=2',
    displayOrder: 2,
    isActive: true,
  },
  {
    _id: '672700000000000000000413',
    section: 'campus_life',
    subtitle: 'Student Transport',
    title: 'New School Van & Rural Connectivity',
    description:
      'Dedicated school van facility blessed and inaugurated by Khanatti Education Society for safe student transport.',
    caption: 'KES Khanatti',
    imageUrl: '/images/school-van.jpg?v=2',
    displayOrder: 3,
    isActive: true,
  },
  {
    _id: '672700000000000000000414',
    section: 'campus_life',
    subtitle: 'Daily Discipline & Values',
    title: 'Morning Assembly & Classroom Learning',
    description:
      'Students gather daily for prayer, pledges, and interactive classroom learning with dedicated teachers.',
    caption: 'KES Khanatti',
    imageUrl: '/images/morning-assembly.jpg?v=2',
    displayOrder: 4,
    isActive: true,
  },
  {
    _id: '672700000000000000000415',
    section: 'campus_life',
    subtitle: 'Cultural & National Pride',
    title: 'Events & National Celebrations',
    description:
      'Celebration of national festivals (Independence Day, Republic Day) and cultural school activities.',
    caption: 'KES Khanatti',
    imageUrl: '/images/events-celebrations.jpg?v=2',
    displayOrder: 5,
    isActive: true,
  },
  {
    _id: '672700000000000000000416',
    section: 'campus_life',
    subtitle: 'Experiential Learning',
    title: 'Play, Learn & Grow',
    description:
      'Activity-based learning with alphabet mats, phonetic games, and joyful group exercises.',
    caption: 'KES Khanatti',
    imageUrl: '/images/play-learn-grow.jpg?v=2',
    displayOrder: 6,
    isActive: true,
  },
];

async function seedSiteContent() {
  try {
    await connectDB();
    for (const sec of ['hero_carousel', 'about_us', 'campus_life']) {
      const count = await SiteContent.countDocuments({ section: sec });
      if (count === 0) {
        const itemsForSec = DEFAULT_SITE_CONTENT.filter((i) => i.section === sec).map(
          ({ _id, ...rest }) => rest
        );
        await SiteContent.insertMany(itemsForSec);
        console.log(`[SeedSiteContent] Seeded ${itemsForSec.length} items for section "${sec}".`);
      }
    }
  } catch (err) {
    console.error('[SeedSiteContent Error]', err.message);
  } finally {
    if (require.main === module) {
      await mongoose.disconnect();
      process.exit(0);
    }
  }
}

if (require.main === module) {
  seedSiteContent();
}

module.exports = { DEFAULT_SITE_CONTENT, seedSiteContent };
