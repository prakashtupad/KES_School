import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Save,
  Printer,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  GraduationCap,
  Users,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  isValidIndianMobile,
  isValidAadhaar,
  sanitizeDigits,
} from '../../utils/validationHelpers';
import { printStudentAdmissionSummary } from '../../utils/printStudentSummary';
import AdmissionPaymentModal from './AdmissionPaymentModal';
import PrintableFeeReceipt from './PrintableFeeReceipt';

const DRAFT_STORAGE_KEY = 'kes_direct_admission_draft_v1';

const GRADE_OPTIONS = [
  'Nursery',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
];

const BLOOD_GROUPS = ['Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'Cat-1', '2A', '2B', '3A', '3B'];

export const INITIAL_ONBOARDING_FORM = {
  // Institutional Identifiers
  admissionNumber: '',
  rollNumber: '',
  grade: 'Grade 1',
  section: 'A',
  academicYear: '2026-2027',
  languageIII: 'Kannada',
  transportRequired: false,
  schoolTransportOptIn: false,

  // Step 1: Student Demographics & Identification
  studentName: '',
  dateOfBirth: '',
  gender: 'Male',
  nationality: 'Indian',
  religion: 'Hindu',
  caste: '',
  category: 'General',
  motherTongue: 'Kannada',
  bloodGroup: 'Unknown',
  aadhaarNumber: '',
  studentAadhaarNo: '',
  isSpecialChild: false,
  specialChildDetails: '',
  identificationMarks: '',
  heightCm: '',
  weightKg: '',
  medicalAilmentsOrAllergies: '',

  // Step 2: Parent / Guardian Particulars
  father: {
    name: '',
    qualification: '',
    profession: '',
    officeAddress: '',
    mobile: '',
    mobileNumber: '',
    email: '',
    aadhaarNo: '',
  },
  mother: {
    name: '',
    qualification: '',
    profession: '',
    officeAddress: '',
    mobile: '',
    mobileNumber: '',
    email: '',
    aadhaarNo: '',
    annualIncome: '',
  },
  primaryPhone: '',
  residentialAddress: {
    villageOrTown: 'Khanatti',
    taluk: 'Mudalgi',
    district: 'Belagavi',
    pincode: '591312',
  },

  // Step 3: Academic History & State Compliance (STS / PEN / APAAR)
  previousStudy: {
    schoolName: '',
    schoolAddress: '',
    affiliatedBoard: 'State Board (KSEAB)',
    standardStudied: '',
    mediumOfInstruction: 'English',
    stsNumber: '',
    penNumber: '',
    apaarId: '',
  },

  // Step 4: Documents, Enclosures & Declaration
  documents: {
    studentPhotoUrl: '',
    birthCertificateUrl: '',
    studentAadhaarUrl: '',
    parentAadhaarUrl: '',
    previousTcUrl: '',
  },
  enclosuresSubmitted: {
    birthCertificate: true,
    studentAadhaar: true,
    parentAadhaar: true,
    transferCertificate: false,
    casteCertificate: false,
    passportPhotos: true,
  },
  declarationAccepted: true,
  status: 'Active',
};

function mapStudentToForm(st) {
  if (!st) return INITIAL_ONBOARDING_FORM;
  const dobStr = st.dateOfBirth
    ? new Date(st.dateOfBirth).toISOString().split('T')[0]
    : '';
  const fatherMobile =
    st.father?.mobile || st.father?.mobileNumber || st.primaryPhone || '';
  const motherMobile = st.mother?.mobile || st.mother?.mobileNumber || '';

  return {
    ...INITIAL_ONBOARDING_FORM,
    admissionNumber: st.admissionNumber || '',
    rollNumber: st.rollNumber || '',
    grade: st.grade || 'Grade 1',
    section: st.section || 'A',
    academicYear: st.academicYear || '2026-2027',
    languageIII: st.languageIII || 'Kannada',
    transportRequired: Boolean(st.transportRequired || st.schoolTransportOptIn),
    schoolTransportOptIn: Boolean(st.schoolTransportOptIn || st.transportRequired),

    studentName: st.studentName || '',
    dateOfBirth: dobStr,
    gender: st.gender || 'Male',
    nationality: st.nationality || 'Indian',
    religion: st.religion || 'Hindu',
    caste: st.caste || '',
    category: st.category || 'General',
    motherTongue: st.motherTongue || 'Kannada',
    bloodGroup: st.bloodGroup || 'Unknown',
    aadhaarNumber: st.aadhaarNumber || st.studentAadhaarNo || '',
    studentAadhaarNo: st.studentAadhaarNo || st.aadhaarNumber || '',
    isSpecialChild: Boolean(st.isSpecialChild),
    specialChildDetails: st.specialChildDetails || '',
    identificationMarks: st.identificationMarks || '',
    heightCm: st.heightCm ?? '',
    weightKg: st.weightKg ?? '',
    medicalAilmentsOrAllergies:
      st.medicalAilmentsOrAllergies || st.medicalAilmentOrAllergy || '',

    father: {
      name: st.father?.name || st.fatherName || '',
      qualification: st.father?.qualification || '',
      profession: st.father?.profession || '',
      officeAddress: st.father?.officeAddress || '',
      mobile: fatherMobile,
      mobileNumber: fatherMobile,
      email: st.father?.email || st.father?.emailId || '',
      aadhaarNo: st.father?.aadhaarNo || '',
    },
    mother: {
      name:
        st.mother?.name && String(st.mother.name) !== 'true'
          ? st.mother.name
          : st.motherName && String(st.motherName) !== 'true'
            ? st.motherName
            : '',
      qualification: st.mother?.qualification || '',
      profession: st.mother?.profession || '',
      officeAddress: st.mother?.officeAddress || '',
      mobile: motherMobile,
      mobileNumber: motherMobile,
      email: st.mother?.email || st.mother?.emailId || '',
      aadhaarNo: st.mother?.aadhaarNo || '',
      annualIncome: st.mother?.annualIncome || '',
    },
    primaryPhone: st.primaryPhone || fatherMobile,
    residentialAddress: {
      villageOrTown:
        st.residentialAddress?.villageOrTown || st.residentialVillage || 'Khanatti',
      taluk: st.residentialAddress?.taluk || 'Mudalgi',
      district: st.residentialAddress?.district || 'Belagavi',
      pincode: st.residentialAddress?.pincode || '591312',
    },
    previousStudy: {
      schoolName: st.previousStudy?.schoolName || '',
      schoolAddress: st.previousStudy?.schoolAddress || '',
      affiliatedBoard:
        st.previousStudy?.affiliatedBoard ||
        st.previousStudy?.schoolAffiliatedTo ||
        'State Board (KSEAB)',
      standardStudied: st.previousStudy?.standardStudied || '',
      mediumOfInstruction: st.previousStudy?.mediumOfInstruction || 'English',
      stsNumber: st.previousStudy?.stsNumber || '',
      penNumber: st.previousStudy?.penNumber || '',
      apaarId: st.previousStudy?.apaarId || '',
    },
    documents: {
      studentPhotoUrl: st.documents?.studentPhotoUrl || '',
      birthCertificateUrl: st.documents?.birthCertificateUrl || '',
      studentAadhaarUrl: st.documents?.studentAadhaarUrl || '',
      parentAadhaarUrl: st.documents?.parentAadhaarUrl || '',
      previousTcUrl: st.documents?.previousTcUrl || '',
    },
    enclosuresSubmitted: {
      birthCertificate: Boolean(st.enclosuresSubmitted?.birthCertificate),
      studentAadhaar: Boolean(st.enclosuresSubmitted?.studentAadhaar),
      parentAadhaar: Boolean(st.enclosuresSubmitted?.parentAadhaar),
      transferCertificate: Boolean(st.enclosuresSubmitted?.transferCertificate),
      casteCertificate: Boolean(st.enclosuresSubmitted?.casteCertificate),
      passportPhotos: Boolean(st.enclosuresSubmitted?.passportPhotos),
    },
    declarationAccepted: st.declarationAccepted !== false,
    status: st.status || 'Active',
  };
}

export default function DirectAdmissionOnboardingModal({
  isOpen = true,
  isModal = true,
  initialStudent = null,
  onEnrollmentComplete,
  onClose,
  onCancel,
}) {
  const { token } = useAuth();
  const isEditing = Boolean(initialStudent?._id);
  const handleDismiss = onClose || onCancel;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => mapStudentToForm(initialStudent));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [draftSavedMsg, setDraftSavedMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    if (initialStudent) {
      setFormData(mapStudentToForm(initialStudent));
      setStep(1);
      setSuccessInfo(null);
      setErrorMessage('');
    } else {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          setFormData({ ...INITIAL_ONBOARDING_FORM, ...JSON.parse(savedDraft) });
        } catch {
          setFormData(INITIAL_ONBOARDING_FORM);
        }
      } else {
        setFormData(INITIAL_ONBOARDING_FORM);
      }
      setStep(1);
      setSuccessInfo(null);
      setErrorMessage('');
    }
  }, [initialStudent, isOpen]);

  if (!isOpen) return null;

  const updateRoot = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const updateNested = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
    setErrorMessage('');
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      setDraftSavedMsg('Draft saved locally!');
      setTimeout(() => setDraftSavedMsg(''), 3000);
    } catch {
      // ignore storage errors
    }
  };

  const validateStep = (targetStep = step) => {
    if (targetStep === 1) {
      if (!formData.studentName.trim()) {
        setErrorMessage('Please enter Student Full Name (As per Aadhaar).');
        return false;
      }
      if (!formData.dateOfBirth) {
        setErrorMessage('Please select the Student Date of Birth.');
        return false;
      }
      if (!formData.grade) {
        setErrorMessage('Please select Class / Grade.');
        return false;
      }
      if (formData.aadhaarNumber && !isValidAadhaar(formData.aadhaarNumber)) {
        setErrorMessage('Student Aadhaar Number must be 12 digits.');
        return false;
      }
    }

    if (targetStep === 2) {
      if (!formData.father.name.trim()) {
        setErrorMessage("Please enter Father's / Primary Guardian's Name.");
        return false;
      }
      const phone = formData.father.mobile || formData.primaryPhone;
      if (!isValidIndianMobile(phone)) {
        setErrorMessage(
          "Please enter a valid 10-digit Indian mobile number for Father's / WhatsApp contact."
        );
        return false;
      }
      if (!formData.mother.name.trim()) {
        setErrorMessage("Please enter Mother's Name.");
        return false;
      }
      if (formData.mother.mobile && !isValidIndianMobile(formData.mother.mobile)) {
        setErrorMessage("Mother's mobile number must be a valid 10-digit number.");
        return false;
      }
      if (!formData.residentialAddress.villageOrTown.trim()) {
        setErrorMessage('Please enter the Residential Village / Town.');
        return false;
      }
    }

    if (targetStep === 4) {
      if (!formData.declarationAccepted) {
        setErrorMessage('Please accept the parent/guardian admission declaration.');
        return false;
      }
    }

    setErrorMessage('');
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleJumpToStep = (target) => {
    if (target < step) {
      setErrorMessage('');
      setStep(target);
      return;
    }
    if (validateStep(step)) {
      setStep(target);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(4)) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const fatherMobile = sanitizeDigits(
      formData.father.mobile || formData.primaryPhone,
      10
    );

    const payload = {
      ...formData,
      studentAadhaarNo: formData.aadhaarNumber,
      schoolTransportOptIn: Boolean(formData.transportRequired),
      fatherName: formData.father.name.trim(),
      motherName: formData.mother.name.trim(),
      primaryPhone: fatherMobile,
      whatsappNumber: fatherMobile,
      residentialVillage: formData.residentialAddress.villageOrTown.trim(),
      father: {
        ...formData.father,
        mobile: fatherMobile,
        mobileNumber: fatherMobile,
        emailId: formData.father.email,
      },
      mother: {
        ...formData.mother,
        mobileNumber: formData.mother.mobile,
        emailId: formData.mother.email,
      },
    };

    try {
      const url = isEditing
        ? `/api/v1/students/${initialStudent._id}`
        : '/api/v1/students/onboard';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.message || 'Failed to save student record');
      }

      if (!isEditing) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      const enrolledStudent = data.student || data.data;
      setSuccessInfo(enrolledStudent);

      // Automatically open AdmissionPaymentModal if fee is not yet paid
      if (enrolledStudent?.feeDetails?.paymentStatus !== 'Paid') {
        setShowPaymentModal(true);
      }

      if (onEnrollmentComplete) {
        onEnrollmentComplete(enrolledStudent);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintAdmissionSummary = () => {
    if (!successInfo) return;
    printStudentAdmissionSummary(successInfo);
  };

  const wizardContent = successInfo ? (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-xl text-center max-w-2xl mx-auto my-4">
      <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-1">
        {isEditing ? 'Record Updated' : 'Pathway 2 Enrollment Confirmed'}
      </span>
      <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy">
        {isEditing
          ? 'Student Profile Updated Successfully!'
          : 'Admission Confirmed & Student Enrolled!'}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 mt-1">
        The student is active in the Student Directory and ready for 1-Click WhatsApp Homework Broadcasts.
      </p>

      <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
        <div>
          <span className="text-slate-500 block text-[11px]">Admission Number</span>
          <span className="font-mono font-bold text-brand-navy bg-brand-goldSoft px-2 py-0.5 rounded border border-brand-gold/40 inline-block mt-0.5">
            {successInfo.admissionNumber}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Student Full Name</span>
          <strong className="text-brand-navy">{successInfo.studentName}</strong>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Class &amp; Section</span>
          <strong className="text-slate-800">
            {successInfo.grade} • Section {successInfo.section || 'A'}
          </strong>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Father &amp; WhatsApp Contact</span>
          <strong className="text-slate-800">
            {successInfo.father?.name || successInfo.fatherName} (+91 {successInfo.primaryPhone})
          </strong>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Karnataka STS / PEN / APAAR</span>
          <span className="font-mono text-xs text-slate-700">
            STS: {successInfo.previousStudy?.stsNumber || '—'} | PEN:{' '}
            {successInfo.previousStudy?.penNumber || '—'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Village / Town</span>
          <strong className="text-slate-800">
            {successInfo.residentialAddress?.villageOrTown ||
              successInfo.residentialVillage ||
              'Khanatti'}
          </strong>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        {successInfo.feeDetails?.paymentStatus === 'Paid' ? (
          <button
            type="button"
            onClick={() => setShowReceiptModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              Print Official Receipt ({successInfo.feeDetails?.receiptNumber || 'Paid'})
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <IndianRupee className="w-4 h-4" />
            <span>Collect Admission Fee &amp; Issue Receipt</span>
          </button>
        )}

        <button
          type="button"
          onClick={handlePrintAdmissionSummary}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-gold hover:bg-brand-goldLight text-brand-navyDark text-xs sm:text-sm font-bold rounded-xl shadow-sm transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Admission Summary</span>
        </button>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setSuccessInfo(null);
              setFormData(INITIAL_ONBOARDING_FORM);
              setStep(1);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-navy hover:bg-brand-navyDark text-white text-xs sm:text-sm font-bold rounded-xl transition"
          >
            <UserPlus className="w-4 h-4 text-brand-gold" />
            <span>+ Enroll Another Student</span>
          </button>
        )}

        {handleDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 transition"
          >
            Return to Student Directory
          </button>
        )}
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-w-4xl w-full mx-auto my-2">
      {/* Wizard Top Header */}
      <div className="bg-brand-navy text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-brand-gold/40">
        <div className="min-w-0">
          <span className="text-brand-gold text-[10px] font-bold uppercase tracking-widest block">
            Pathway 2 • Direct Walk-In Student Onboarding
          </span>
          <h2 className="text-base sm:text-lg font-serif font-bold truncate">
            {isEditing
              ? `Edit Student Profile: ${formData.studentName}`
              : 'Direct Walk-In Admission & Statutory Onboarding'}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isEditing && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/20 transition"
              title="Save form draft locally"
            >
              <Save className="w-3.5 h-3.5 text-brand-gold" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
          )}
          {handleDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              aria-label="Close onboarding wizard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Step Indicator Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-100 border-b border-slate-200 text-xs font-bold">
        {[
          { num: 1, short: '1. Demographics', full: '1. Student Demographics', icon: GraduationCap },
          { num: 2, short: '2. Parents', full: '2. Parent Particulars', icon: Users },
          { num: 3, short: '3. STS / Academic', full: '3. Academic & State IDs', icon: ShieldCheck },
          { num: 4, short: '4. Docs & Submit', full: '4. Documents & Submit', icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = step === tab.num;
          const completed = step > tab.num;
          return (
            <button
              key={tab.num}
              type="button"
              onClick={() => handleJumpToStep(tab.num)}
              className={`py-2.5 px-2 border-b-2 flex items-center justify-center gap-1.5 transition ${
                active
                  ? 'border-brand-gold text-brand-navy bg-white'
                  : completed
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.full}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback / Validation Banner */}
      {(errorMessage || draftSavedMsg) && (
        <div className="px-4 sm:px-6 pt-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {draftSavedMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{draftSavedMsg}</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
        {/* STEP 1: STUDENT DEMOGRAPHICS & IDENTIFICATION */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm sm:text-base font-serif font-bold text-brand-navy">
                Step 1: Student Demographics &amp; Identification
              </h3>
              <span className="text-[11px] text-slate-500">* Required fields</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Class / Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => updateRoot('grade', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white focus:border-brand-navy"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Section
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => updateRoot('section', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white focus:border-brand-navy"
                >
                  <option value="N/A">N/A (Not Applicable)</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Admission No
                </label>
                <input
                  type="text"
                  placeholder="Auto if blank"
                  value={formData.admissionNumber}
                  onChange={(e) => updateRoot('admissionNumber', e.target.value.toUpperCase())}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Roll No
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01"
                  value={formData.rollNumber}
                  onChange={(e) => updateRoot('rollNumber', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Student Full Name (As per Aadhaar) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basavaraj Ramesh Patil"
                  value={formData.studentName}
                  onChange={(e) => updateRoot('studentName', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => updateRoot('dateOfBirth', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateRoot('gender', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Student Aadhaar (12 Digits)
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="12-digit UID"
                  value={formData.aadhaarNumber}
                  onChange={(e) =>
                    updateRoot('aadhaarNumber', sanitizeDigits(e.target.value, 12))
                  }
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => updateRoot('bloodGroup', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateRoot('category', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Religion
                </label>
                <input
                  type="text"
                  value={formData.religion}
                  onChange={(e) => updateRoot('religion', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Caste
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lingayat"
                  value={formData.caste}
                  onChange={(e) => updateRoot('caste', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Mother Tongue
                </label>
                <input
                  type="text"
                  value={formData.motherTongue}
                  onChange={(e) => updateRoot('motherTongue', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Special Child (CWSN)?
                </label>
                <select
                  value={formData.isSpecialChild ? 'Yes' : 'No'}
                  onChange={(e) => updateRoot('isSpecialChild', e.target.value === 'Yes')}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            {/* Physical & Medical Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 112"
                  value={formData.heightCm}
                  onChange={(e) => updateRoot('heightCm', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 19"
                  value={formData.weightKg}
                  onChange={(e) => updateRoot('weightKg', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Identification Marks
                </label>
                <input
                  type="text"
                  placeholder="Mole on right hand..."
                  value={formData.identificationMarks}
                  onChange={(e) => updateRoot('identificationMarks', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Medical / Allergies
                </label>
                <input
                  type="text"
                  placeholder="None"
                  value={formData.medicalAilmentsOrAllergies}
                  onChange={(e) => updateRoot('medicalAilmentsOrAllergies', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PARENT / GUARDIAN PARTICULARS */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-serif font-bold text-brand-navy border-b border-slate-200 pb-2">
              Step 2: Parent / Guardian &amp; Residential Particulars
            </h3>

            {/* Father Particulars */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                Father / Primary Guardian Particulars
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Father&apos;s Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={formData.father.name}
                    onChange={(e) => updateNested('father', 'name', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    10-Digit Mobile (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9845012345"
                    value={formData.father.mobile}
                    onChange={(e) => {
                      const clean = sanitizeDigits(e.target.value, 10);
                      updateNested('father', 'mobile', clean);
                      updateRoot('primaryPhone', clean);
                    }}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.A. / SSLC"
                    value={formData.father.qualification}
                    onChange={(e) => updateNested('father', 'qualification', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Profession / Occupation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Agriculture / Business"
                    value={formData.father.profession}
                    onChange={(e) => updateNested('father', 'profession', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Office / Work Address
                  </label>
                  <input
                    type="text"
                    placeholder="Khanatti / Gokak"
                    value={formData.father.officeAddress}
                    onChange={(e) => updateNested('father', 'officeAddress', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="parent@email.com"
                    value={formData.father.email}
                    onChange={(e) => updateNested('father', 'email', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Mother Particulars */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                Mother Particulars
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mother&apos;s Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavita Patil"
                    value={formData.mother.name}
                    onChange={(e) => updateNested('mother', 'name', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mother&apos;s Mobile
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Optional 10-digit"
                    value={formData.mother.mobile}
                    onChange={(e) =>
                      updateNested('mother', 'mobile', sanitizeDigits(e.target.value, 10))
                    }
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PUC / B.Ed"
                    value={formData.mother.qualification}
                    onChange={(e) => updateNested('mother', 'qualification', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Homemaker"
                    value={formData.mother.profession}
                    onChange={(e) => updateNested('mother', 'profession', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Annual Family Income (₹)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1,20,000"
                    value={formData.mother.annualIncome}
                    onChange={(e) => updateNested('mother', 'annualIncome', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Office / Work Address
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={formData.mother.officeAddress}
                    onChange={(e) => updateNested('mother', 'officeAddress', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Residential Address */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                Residential Address
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Village / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.residentialAddress.villageOrTown}
                    onChange={(e) =>
                      updateNested('residentialAddress', 'villageOrTown', e.target.value)
                    }
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Taluk</label>
                  <input
                    type="text"
                    value={formData.residentialAddress.taluk}
                    onChange={(e) => updateNested('residentialAddress', 'taluk', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.residentialAddress.district}
                    onChange={(e) => updateNested('residentialAddress', 'district', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.residentialAddress.pincode}
                    onChange={(e) =>
                      updateNested(
                        'residentialAddress',
                        'pincode',
                        sanitizeDigits(e.target.value, 6)
                      )
                    }
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ACADEMIC HISTORY & KARNATAKA STATE COMPLIANCE */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-serif font-bold text-brand-navy border-b border-slate-200 pb-2">
              Step 3: Academic History &amp; Karnataka State Compliance (STS / PEN / APAAR)
            </h3>

            {/* Statutory IDs Callout Box */}
            <div className="p-4 bg-brand-goldSoft/60 border border-brand-gold/40 rounded-xl space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-navyDark">
                Statutory Karnataka &amp; National Education Identifiers
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Karnataka STS / SATS Number
                  </label>
                  <input
                    type="text"
                    placeholder="9-digit STS Number"
                    value={formData.previousStudy.stsNumber}
                    onChange={(e) => updateNested('previousStudy', 'stsNumber', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Central PEN (Permanent Edu No.)
                  </label>
                  <input
                    type="text"
                    placeholder="National PEN Number"
                    value={formData.previousStudy.penNumber}
                    onChange={(e) => updateNested('previousStudy', 'penNumber', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    APAAR ID (One Nation One ID)
                  </label>
                  <input
                    type="text"
                    placeholder="12-digit APAAR ID"
                    value={formData.previousStudy.apaarId}
                    onChange={(e) => updateNested('previousStudy', 'apaarId', e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Previous School Particulars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Previous School Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Govt Primary School, Khanatti"
                  value={formData.previousStudy.schoolName}
                  onChange={(e) => updateNested('previousStudy', 'schoolName', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Previous School Address
                </label>
                <input
                  type="text"
                  placeholder="Village / Town"
                  value={formData.previousStudy.schoolAddress}
                  onChange={(e) => updateNested('previousStudy', 'schoolAddress', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Affiliated Board
                </label>
                <select
                  value={formData.previousStudy.affiliatedBoard}
                  onChange={(e) =>
                    updateNested('previousStudy', 'affiliatedBoard', e.target.value)
                  }
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="State Board (KSEAB)">State Board (KSEAB)</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="First Time Admission (Pre-Primary)">
                    First Time Admission (Pre-Primary)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Last Standard / Class Studied
                </label>
                <input
                  type="text"
                  placeholder="e.g. UKG / Grade 1"
                  value={formData.previousStudy.standardStudied}
                  onChange={(e) =>
                    updateNested('previousStudy', 'standardStudied', e.target.value)
                  }
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* 3rd Language & School Transport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  3rd Language Selection (Language III)
                </label>
                <select
                  value={formData.languageIII}
                  onChange={(e) => updateRoot('languageIII', e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Kannada">Kannada</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="None">None / Not Applicable</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  School Van / Transport Required?
                </label>
                <select
                  value={formData.transportRequired ? 'Yes' : 'No'}
                  onChange={(e) => updateRoot('transportRequired', e.target.value === 'Yes')}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="No">No (Self-Commute)</option>
                  <option value="Yes">Yes (School Van Required)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENTS, DECLARATION & SUBMIT */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-serif font-bold text-brand-navy border-b border-slate-200 pb-2">
              Step 4: Enclosures Checklist, Document References &amp; Submit
            </h3>

            {/* Physical Enclosures Verification Checklist */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-navy block">
                Physical Enclosures Verified at Office Desk
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'birthCertificate', label: "Copy of Child's Birth Certificate" },
                  { key: 'studentAadhaar', label: "Copy of Student's Aadhaar Card" },
                  { key: 'parentAadhaar', label: "Copy of Father/Mother Aadhaar Card" },
                  { key: 'transferCertificate', label: 'Original Transfer Certificate (TC / SATS)' },
                  { key: 'casteCertificate', label: 'Caste & Income Certificate Copy' },
                  { key: 'passportPhotos', label: '4 Passport Size Photographs' },
                ].map((doc) => (
                  <label
                    key={doc.key}
                    className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1.5 rounded hover:bg-white transition"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(formData.enclosuresSubmitted[doc.key])}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          enclosuresSubmitted: {
                            ...prev.enclosuresSubmitted,
                            [doc.key]: e.target.checked,
                          },
                        }))
                      }
                      className="rounded text-brand-navy focus:ring-brand-gold h-4 w-4"
                    />
                    <span>{doc.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Document Reference / Scan URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Student Photo File / Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="File ref or URL (e.g. Photo_Submitted.jpg)"
                  value={formData.documents.studentPhotoUrl}
                  onChange={(e) =>
                    updateNested('documents', 'studentPhotoUrl', e.target.value)
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Birth Certificate Ref / No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Certificate No. or Scan URL"
                  value={formData.documents.birthCertificateUrl}
                  onChange={(e) =>
                    updateNested('documents', 'birthCertificateUrl', e.target.value)
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Student Aadhaar Doc Ref (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Verified Copy on File"
                  value={formData.documents.studentAadhaarUrl}
                  onChange={(e) =>
                    updateNested('documents', 'studentAadhaarUrl', e.target.value)
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Parent Aadhaar Doc Ref (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Verified Copy on File"
                  value={formData.documents.parentAadhaarUrl}
                  onChange={(e) =>
                    updateNested('documents', 'parentAadhaarUrl', e.target.value)
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* Institutional Declaration */}
            <label className="flex items-start gap-2.5 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.declarationAccepted}
                onChange={(e) => updateRoot('declarationAccepted', e.target.checked)}
                className="mt-0.5 rounded text-brand-navy focus:ring-brand-gold h-4 w-4 flex-shrink-0"
              />
              <span>
                <strong>Official Admission Declaration:</strong> I confirm that the student and
                parent particulars for{' '}
                <strong className="text-brand-navy">
                  {formData.studentName || 'the applicant'}
                </strong>{' '}
                have been verified against original Aadhaar and Birth Certificate documents for
                enrollment at Shri Siddharoodha English Medium School, Khanatti.
              </span>
            </label>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Save Draft
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-navy hover:bg-brand-navyDark text-white text-xs font-bold rounded-lg shadow transition"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-gold hover:bg-brand-goldLight disabled:opacity-60 text-brand-navyDark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Saving...'
                    : isEditing
                    ? 'Save Updated Profile'
                    : 'Confirm Admission & Enroll'}
                </span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );

  const paymentAndReceiptOverlays = (
    <>
      {showPaymentModal && successInfo && (
        <AdmissionPaymentModal
          isOpen={showPaymentModal}
          student={successInfo}
          onClose={() => setShowPaymentModal(false)}
          onPaymentRecorded={(updatedStudent) => {
            setSuccessInfo(updatedStudent);
            if (onEnrollmentComplete) {
              onEnrollmentComplete(updatedStudent);
            }
          }}
        />
      )}

      {showReceiptModal && successInfo && (
        <PrintableFeeReceipt
          student={successInfo}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </>
  );

  if (!isModal) {
    return (
      <>
        {wizardContent}
        {paymentAndReceiptOverlays}
      </>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Direct Student Admission & Onboarding Wizard"
    >
      {wizardContent}
      {paymentAndReceiptOverlays}
    </div>
  );
}
