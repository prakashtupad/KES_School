import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Image as ImageIcon,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Upload,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BUILTIN_IMAGES = [
  { label: 'Governance & Campus', url: '/images/governance-campus.jpg' },
  { label: 'Interactive Classroom', url: '/images/interactive-classroom.jpg' },
  { label: 'Joyful Campus Activities', url: '/images/campus-joy.jpg' },
  { label: 'Morning Assembly', url: '/images/morning-assembly.jpg' },
  { label: 'Main Campus Entrance', url: '/images/campus-entrance.jpg?v=2' },
  { label: 'School Van Transport', url: '/images/school-van.jpg?v=2' },
  { label: 'Events & Celebrations', url: '/images/events-celebrations.jpg?v=2' },
  { label: 'Play, Learn & Grow', url: '/images/play-learn-grow.jpg?v=2' },
];

const INITIAL_FORM = {
  section: 'hero_carousel',
  title: '',
  subtitle: '',
  description: '',
  secondaryDescription: '',
  imageUrl: '/images/governance-campus.jpg',
  caption: 'Guided by Moral Values & Community Excellence',
  primaryButtonText: 'Enquire for 2026–27',
  primaryButtonLink: '#enquiry',
  secondaryButtonText: 'Learn Our Story',
  secondaryButtonLink: '#about',
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
};

export default function WebsiteContentDesk() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('hero_carousel');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Editor Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Birthday Celebration CMS Settings
  const [birthdaySettings, setBirthdaySettings] = useState({
    enableBirthdayTicker: true,
    enableBirthdayCampusCard: true,
    customBirthdayWishTemplate: 'Wishing you joy, good health, and academic excellence! 🎂✨',
  });
  const [savingBirthdaySettings, setSavingBirthdaySettings] = useState(false);

  const fetchBirthdaySettings = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/birthdays/settings');
      const data = await res.json();
      if (res.ok && data.success && data.settings) {
        setBirthdaySettings({
          enableBirthdayTicker: data.settings.enableBirthdayTicker !== false,
          enableBirthdayCampusCard: data.settings.enableBirthdayCampusCard !== false,
          customBirthdayWishTemplate:
            data.settings.customBirthdayWishTemplate ||
            'Wishing you joy, good health, and academic excellence! 🎂✨',
        });
      }
    } catch (err) {
      // Ignore fallback
    }
  }, []);

  const handleToggleBirthdaySetting = async (field, nextValue) => {
    const updated = { ...birthdaySettings, [field]: nextValue };
    setBirthdaySettings(updated);
    setSavingBirthdaySettings(true);
    try {
      const res = await fetch('/api/v1/birthdays/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: 'Birthday Celebration CMS settings updated on the website!',
        });
        setTimeout(() => setFeedback({ type: '', message: '' }), 3500);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Failed to save Birthday Celebration settings.',
      });
    } finally {
      setSavingBirthdaySettings(false);
    }
  };

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/content?section=${activeTab}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.data || data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch CMS content:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchContent();
    fetchBirthdaySettings();
  }, [fetchContent, fetchBirthdaySettings]);

  const isHeroTab = activeTab === 'hero_carousel';
  const isAboutTab = activeTab === 'about_us';
  const isCampusTab = activeTab === 'campus_life';

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormError('');
    const nextOrder = items.length + 1;

    if (isAboutTab) {
      setFormData({
        ...INITIAL_FORM,
        section: 'about_us',
        subtitle: 'Welcome to Our School',
        title: 'Khanatti Education Society’s Shri Siddharoodha English Medium School',
        description:
          'Established under the patronage of Khanatti Education Society in Khanatti, our institution is committed to bringing accessible, disciplined, and nurturing English medium education to children of the local community.',
        secondaryDescription:
          'Our campus provides an atmosphere of mutual respect, cultural grounding, and moral integrity inspired by the teachings of Sadguru Shri Siddharoodha Swamiji.',
        imageUrl: '/images/governance-campus.jpg?v=2',
        caption: 'Shri Siddharoodha English Medium School Campus & Assembly Ground',
        displayOrder: 1,
      });
    } else {
      setFormData({
        ...INITIAL_FORM,
        section: activeTab,
        subtitle: isHeroTab ? 'WELCOME TO KHANATTI' : 'School Infrastructure',
        caption: isHeroTab
          ? 'Guided by Moral Values & Community Excellence'
          : 'KES Khanatti',
        imageUrl: isHeroTab
          ? '/images/governance-campus.jpg'
          : '/images/interactive-classroom.jpg?v=2',
        displayOrder: nextOrder,
      });
    }
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormError('');
    setFormData({
      ...INITIAL_FORM,
      section: item.section || activeTab,
      title: item.title || '',
      subtitle: item.subtitle || '',
      description: item.description || '',
      secondaryDescription: item.secondaryDescription || '',
      imageUrl: item.imageUrl || '',
      caption: item.caption || '',
      primaryButtonText: item.primaryButtonText || 'Enquire for 2026–27',
      primaryButtonLink: item.primaryButtonLink || '#enquiry',
      secondaryButtonText: item.secondaryButtonText || '',
      secondaryButtonLink: item.secondaryButtonLink || '',
      pillar1Title: item.pillar1Title || INITIAL_FORM.pillar1Title,
      pillar1Description: item.pillar1Description || INITIAL_FORM.pillar1Description,
      pillar2Title: item.pillar2Title || INITIAL_FORM.pillar2Title,
      pillar2Description: item.pillar2Description || INITIAL_FORM.pillar2Description,
      governanceTitle: item.governanceTitle || INITIAL_FORM.governanceTitle,
      governanceSubtitle: item.governanceSubtitle || INITIAL_FORM.governanceSubtitle,
      displayOrder: item.displayOrder ?? 1,
      isActive: item.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setFormError('Image file size should be under 3 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.imageUrl.trim()) {
      setFormError('Title, Description, and Image URL are required.');
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = Boolean(editingItem?._id);
      const url = isEditing ? `/api/v1/content/${editingItem._id}` : '/api/v1/content';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          section: activeTab,
          displayOrder: Number(formData.displayOrder) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to save content item.');
      }

      setFeedback({
        type: 'success',
        message: isEditing
          ? `Updated "${formData.title}" — live on the public website!`
          : `Added "${formData.title}" — live on the public website!`,
      });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      setModalOpen(false);
      setEditingItem(null);
      fetchContent();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      const res = await fetch(`/api/v1/content/${item._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: `Removed "${item.title}" from the public website.`,
        });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
        fetchContent();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Failed to delete content item.',
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold block">
            Dynamic Website Content Management (CMS)
          </span>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
            Website Content (CMS)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Customize the Hero Carousel Banner, About Us Section, and Student &amp; Campus Life cards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={fetchContent}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-navy hover:bg-slate-50 transition"
            title="Refresh content"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isAboutTab && items.length > 0 ? (
            <button
              type="button"
              onClick={() => handleOpenEditModal(items[0])}
              className="inline-flex items-center gap-1.5 bg-brand-navy hover:bg-brand-navyDark text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm border border-brand-gold/40 transition"
            >
              <Pencil className="w-3.5 h-3.5 text-brand-gold" />
              <span>Edit About Us Content</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-brand-navy hover:bg-brand-navyDark text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm border border-brand-gold/40 transition"
            >
              <Plus className="w-3.5 h-3.5 text-brand-gold" />
              <span>
                {isHeroTab
                  ? '+ Add New Slide'
                  : isAboutTab
                  ? '+ Configure About Us'
                  : '+ Add New Campus Card'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Three Tab Switcher */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex flex-wrap gap-1.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setActiveTab('hero_carousel')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
            isHeroTab
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 text-brand-gold" />
          <span>1. Hero Carousel Slides</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about_us')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
            isAboutTab
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-brand-gold" />
          <span>2. About Us Section</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campus_life')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
            isCampusTab
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-brand-gold" />
          <span>3. Student &amp; Campus Life</span>
        </button>
      </div>

      {/* Birthday Celebration Settings Card */}
      <div className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/50 rounded-xl border border-amber-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-lg flex-shrink-0">
              🎂
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Automated Birthday Celebration &amp; Announcement System
              </span>
              <h3 className="text-sm sm:text-base font-serif font-bold text-brand-navy">
                Birthday Celebration Settings
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Control whether today&apos;s student and staff birthdays appear in the top announcement micro-ticker and the Campus Life &ldquo;Star of the Day&rdquo; card.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <label className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-brand-gold/60 transition">
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">
                  Announcement Micro-Ticker
                </div>
                <div className="text-[10px] text-slate-500">
                  Show birthday wishes in top bar
                </div>
              </div>
              <input
                type="checkbox"
                checked={birthdaySettings.enableBirthdayTicker}
                disabled={savingBirthdaySettings}
                onChange={(e) =>
                  handleToggleBirthdaySetting('enableBirthdayTicker', e.target.checked)
                }
                className="w-4 h-4 accent-brand-navy rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-brand-gold/60 transition">
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">
                  Star of the Day Card
                </div>
                <div className="text-[10px] text-slate-500">
                  Show Birthday Corner in Campus Life
                </div>
              </div>
              <input
                type="checkbox"
                checked={birthdaySettings.enableBirthdayCampusCard}
                disabled={savingBirthdaySettings}
                onChange={(e) =>
                  handleToggleBirthdaySetting('enableBirthdayCampusCard', e.target.checked)
                }
                className="w-4 h-4 accent-brand-navy rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Content Items Display */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs sm:text-sm text-slate-500">
          Loading CMS content...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
          <p className="font-serif font-bold text-brand-navy text-sm">
            No content configured for this section yet
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-brand-navy text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5 text-brand-gold" />
            <span>Create Content</span>
          </button>
        </div>
      ) : isAboutTab ? (
        /* ABOUT US SECTION OVERVIEW CARD */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          {items.map((aboutItem) => (
            <div key={aboutItem._id} className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-brand-gold font-bold text-xs uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-brand-gold" />
                    {aboutItem.subtitle || 'Welcome to Our School'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-brand-navy mt-1">
                    {aboutItem.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(aboutItem)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-navy hover:bg-brand-navyDark text-white text-xs font-bold shadow-sm transition"
                >
                  <Pencil className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Edit About Us Section</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {aboutItem.description}
                  </p>
                  {aboutItem.secondaryDescription && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {aboutItem.secondaryDescription}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded bg-brand-navy/10 text-brand-navy flex items-center justify-center text-xs font-bold mb-1.5">
                        1
                      </div>
                      <h4 className="font-bold text-xs text-brand-navy mb-1">
                        {aboutItem.pillar1Title || 'Our Approved Vision'}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {aboutItem.pillar1Description}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-bold mb-1.5">
                        2
                      </div>
                      <h4 className="font-bold text-xs text-brand-navy mb-1">
                        {aboutItem.pillar2Title || 'Our Learning Approach'}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {aboutItem.pillar2Description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-brand-cream border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 mb-3 bg-white">
                      <img
                        src={aboutItem.imageUrl}
                        alt={aboutItem.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-brand-navyDark/85 text-white text-[11px] py-1.5 px-2 font-medium truncate">
                        {aboutItem.caption}
                      </div>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-brand-navy">
                      {aboutItem.governanceTitle || 'Khanatti Education Society Governance'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {aboutItem.governanceSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* HERO CAROUSEL SLIDES & CAMPUS LIFE CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-brand-gold/50 transition"
            >
              <div>
                {/* Preview Thumbnail Header */}
                <div className="relative h-48 bg-brand-navyDark overflow-hidden border-b border-slate-200">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navyDark/85 via-brand-navyDark/20 to-transparent" />

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-brand-navyDark/90 text-brand-gold text-[10px] font-mono font-bold border border-brand-gold/40">
                      Order #{item.displayOrder || 1}
                    </span>
                    {item.subtitle && (
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-gold text-brand-navyDark text-[10px] font-bold uppercase tracking-wider">
                        {item.subtitle}
                      </span>
                    )}
                  </div>

                  {item.caption && (
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                      <span className="truncate">{item.caption}</span>
                      <span className="text-brand-gold font-semibold flex-shrink-0 ml-2">
                        KES Khanatti
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-4 space-y-1.5">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-brand-navy">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {isHeroTab && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      {item.primaryButtonText && (
                        <span className="px-2 py-0.5 rounded bg-brand-goldSoft text-brand-navyDark border border-brand-gold/40 font-semibold">
                          CTA 1: {item.primaryButtonText} ({item.primaryButtonLink || '#enquiry'})
                        </span>
                      )}
                      {item.secondaryButtonText && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                          CTA 2: {item.secondaryButtonText} ({item.secondaryButtonLink || '#about'})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                  {item.imageUrl.startsWith('data:') ? 'Uploaded Custom Image' : item.imageUrl}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-brand-navy text-xs font-bold transition"
                  >
                    <Pencil className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Slide, About Us, or Campus Card Modal with Live Preview */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cmsModalTitle"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full overflow-hidden my-4">
            {/* Modal Header */}
            <div className="bg-brand-navy text-white px-5 py-3.5 flex items-center justify-between border-b border-brand-gold/40">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block">
                  {isHeroTab
                    ? 'Hero Carousel Slide Editor'
                    : isAboutTab
                    ? 'About Us Section Editor'
                    : 'Student & Campus Life Card Editor'}
                </span>
                <h3 id="cmsModalTitle" className="text-base font-serif font-bold">
                  {editingItem
                    ? `Edit ${
                        isHeroTab
                          ? 'Hero Slide'
                          : isAboutTab
                          ? 'About Us Section'
                          : 'Campus Card'
                      }`
                    : `Add New ${
                        isHeroTab
                          ? 'Hero Carousel Slide'
                          : isAboutTab
                          ? 'About Us Content'
                          : 'Campus Life Card'
                      }`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveContent}
              className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[82vh] overflow-y-auto"
            >
              {/* Left Column: Form Inputs */}
              <div className="lg:col-span-7 space-y-3.5">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      {isHeroTab
                        ? 'Badge Tag (Subtitle) *'
                        : isAboutTab
                        ? 'Section Badge Tag *'
                        : 'Card Category Tag *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                      }
                      placeholder={
                        isHeroTab
                          ? 'e.g. WELCOME TO KHANATTI'
                          : isAboutTab
                          ? 'e.g. Welcome to Our School'
                          : 'e.g. School Infrastructure'
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      <span className="inline-flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3 text-brand-gold" />
                        Display Order
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, displayOrder: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-mono focus:border-brand-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    {isHeroTab
                      ? 'Slide Heading (Title) *'
                      : isAboutTab
                      ? 'About Us Main Heading *'
                      : 'Card Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder={
                      isHeroTab
                        ? 'e.g. Inspiring with Values & Quality Education'
                        : isAboutTab
                        ? 'e.g. Khanatti Education Society’s Shri Siddharoodha English Medium School'
                        : 'e.g. School Building & Play Area'
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    {isAboutTab ? 'Introduction Paragraph 1 *' : 'Description *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Enter description text..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy"
                  />
                </div>

                {isAboutTab && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Introduction Paragraph 2 (Values &amp; Heritage)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.secondaryDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            secondaryDescription: e.target.value,
                          }))
                        }
                        placeholder="Second paragraph of About Us section..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase text-brand-navy">
                          Pillar 1 Title (Vision)
                        </label>
                        <input
                          type="text"
                          value={formData.pillar1Title}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pillar1Title: e.target.value,
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <textarea
                          rows={2}
                          value={formData.pillar1Description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pillar1Description: e.target.value,
                            }))
                          }
                          placeholder="Pillar 1 description..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase text-brand-navy">
                          Pillar 2 Title (Approach)
                        </label>
                        <input
                          type="text"
                          value={formData.pillar2Title}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pillar2Title: e.target.value,
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <textarea
                          rows={2}
                          value={formData.pillar2Description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pillar2Description: e.target.value,
                            }))
                          }
                          placeholder="Pillar 2 description..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Governance Card Heading
                        </label>
                        <input
                          type="text"
                          value={formData.governanceTitle}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              governanceTitle: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Governance Card Subtitle
                        </label>
                        <input
                          type="text"
                          value={formData.governanceSubtitle}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              governanceSubtitle: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Image URL + Quick Preset Selector + Upload */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Image URL or Upload Photo *
                    </label>
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-navy text-white text-[11px] font-bold cursor-pointer hover:bg-brand-navyDark transition">
                      <Upload className="w-3 h-3 text-brand-gold" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                    placeholder="/images/governance-campus.jpg or https://..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white focus:border-brand-navy"
                  />

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Presets:
                    </span>
                    {BUILTIN_IMAGES.map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, imageUrl: img.url }))
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                          formData.imageUrl === img.url
                            ? 'bg-brand-navy text-white border-brand-navy'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-gold'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Image Caption Footer
                  </label>
                  <input
                    type="text"
                    value={formData.caption}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, caption: e.target.value }))
                    }
                    placeholder="e.g. Guided by Moral Values & Community Excellence"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy"
                  />
                </div>

                {isHeroTab && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Primary CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.primaryButtonText}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            primaryButtonText: e.target.value,
                          }))
                        }
                        placeholder="Enquire for 2026–27"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Primary CTA Link
                      </label>
                      <input
                        type="text"
                        value={formData.primaryButtonLink}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            primaryButtonLink: e.target.value,
                          }))
                        }
                        placeholder="#enquiry"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Secondary Button Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryButtonText}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            secondaryButtonText: e.target.value,
                          }))
                        }
                        placeholder="Learn Our Story"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Secondary Button Link
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryButtonLink}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            secondaryButtonLink: e.target.value,
                          }))
                        }
                        placeholder="#about"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Quick Live Preview Card */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-navy">
                    <Eye className="w-4 h-4 text-brand-gold" />
                    <span>Live Brand Preview</span>
                  </div>

                  {isHeroTab ? (
                    /* Hero Slide Live Preview */
                    <div className="rounded-2xl bg-brand-navy text-white p-4 border-2 border-brand-gold/40 shadow-lg space-y-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] font-bold uppercase tracking-wider border border-brand-gold/30">
                        {formData.subtitle || 'WELCOME TO KHANATTI'}
                      </span>
                      <h4 className="font-serif font-bold text-base leading-snug text-white">
                        {formData.title || 'Slide Heading Preview'}
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {formData.description ||
                          'Slide description text will appear here on the public homepage banner.'}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {formData.primaryButtonText && (
                          <span className="px-3 py-1.5 rounded bg-brand-gold text-brand-navyDark font-bold text-[11px]">
                            {formData.primaryButtonText} →
                          </span>
                        )}
                        {formData.secondaryButtonText && (
                          <span className="px-3 py-1.5 rounded bg-white/10 text-white border border-white/30 text-[11px]">
                            {formData.secondaryButtonText}
                          </span>
                        )}
                      </div>
                      <div className="rounded-xl overflow-hidden border border-brand-gold/40 bg-brand-navyDark mt-2">
                        <img
                          src={formData.imageUrl}
                          alt="Slide preview"
                          className="w-full h-44 object-cover object-center"
                        />
                        <div className="px-3 py-1.5 bg-brand-navyDark text-[10px] text-slate-200 flex items-center justify-between border-t border-brand-gold/30">
                          <span className="truncate">{formData.caption || 'KES Khanatti'}</span>
                          <span className="text-brand-gold font-bold ml-2">KES Khanatti</span>
                        </div>
                      </div>
                    </div>
                  ) : isAboutTab ? (
                    /* About Us Live Preview */
                    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-md space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                        • {formData.subtitle || 'Welcome to Our School'}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-brand-navy leading-snug">
                        {formData.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-3">
                        {formData.description}
                      </p>
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-brand-cream p-2.5 text-center">
                        <img
                          src={formData.imageUrl}
                          alt="About preview"
                          className="w-full h-36 object-cover rounded-lg mb-2"
                        />
                        <div className="text-[11px] font-bold text-brand-navy">
                          {formData.governanceTitle}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formData.caption}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Campus Life Card Live Preview */
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-md">
                      <div className="relative aspect-[16/10] bg-slate-200 border-b border-slate-200 overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Campus Card Preview"
                          className="w-full h-full object-cover object-center"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-brand-navyDark/85 text-brand-goldSoft text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-brand-gold/40">
                          {formData.subtitle || 'Campus Category'}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-brand-navy">
                          {formData.title || 'Card Title Preview'}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {formData.description ||
                            'Card description will appear here in the Student & Campus Life showcase.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Action Buttons */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white text-xs font-bold shadow transition"
                  >
                    {submitting
                      ? 'Publishing...'
                      : editingItem
                      ? 'Save Changes'
                      : 'Publish to Website'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
