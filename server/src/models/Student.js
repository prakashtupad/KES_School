const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // Institutional Identifiers
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    rollNumber: {
      type: String,
      trim: true,
      default: '',
    },
    grade: {
      type: String,
      required: [true, 'Grade / Class is required'],
      enum: [
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
      ],
      index: true,
    },
    section: {
      type: String,
      default: 'A',
      uppercase: true,
      trim: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
      index: true,
    },
    languageIII: {
      type: String,
      enum: ['Kannada', 'Hindi', 'Sanskrit', 'None', 'Not Applicable'],
      default: 'Kannada',
    },
    transportRequired: {
      type: Boolean,
      default: false,
    },
    schoolTransportOptIn: {
      type: Boolean,
      default: false,
    },

    // 1. Demographics & Compliance ("As per Aadhaar")
    studentName: {
      type: String,
      required: [true, 'Student name as per Aadhaar is required'],
      trim: true,
      maxlength: 120,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    displayBirthdayPublicly: {
      type: Boolean,
      default: true,
      index: true,
    },
    honorific: {
      type: String,
      enum: ['Master', 'Kumari', 'None'],
      default: 'None',
    },
    nationality: {
      type: String,
      default: 'Indian',
      trim: true,
    },
    religion: {
      type: String,
      default: 'Hindu',
      trim: true,
    },
    caste: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'Cat-1', '2A', '2B', '3A', '3B'],
      default: 'General',
    },
    motherTongue: {
      type: String,
      default: 'Kannada',
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''],
      default: 'Unknown',
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      default: '',
    },
    studentAadhaarNo: {
      type: String,
      trim: true,
      default: '',
    },
    isSpecialChild: {
      type: Boolean,
      default: false,
    },
    specialChildDetails: {
      type: String,
      trim: true,
      default: '',
    },
    identificationMarks: {
      type: String,
      trim: true,
      default: '',
    },
    heightCm: {
      type: Number,
    },
    weightKg: {
      type: Number,
    },
    medicalAilmentsOrAllergies: {
      type: String,
      trim: true,
      default: '',
    },
    medicalAilmentOrAllergy: {
      type: String,
      trim: true,
      default: '',
    },

    // 2. Parent Particulars (Nested + Flat Compatibility)
    father: {
      name: { type: String, trim: true, default: '' },
      qualification: { type: String, trim: true, default: '' },
      profession: { type: String, trim: true, default: '' },
      officeAddress: { type: String, trim: true, default: '' },
      mobile: { type: String, trim: true, default: '' },
      mobileNumber: { type: String, trim: true, default: '' },
      email: { type: String, lowercase: true, trim: true, default: '' },
      emailId: { type: String, lowercase: true, trim: true, default: '' },
      aadhaarNo: { type: String, trim: true, default: '' },
      panNo: { type: String, uppercase: true, trim: true, default: '' },
    },
    mother: {
      name: { type: String, trim: true, default: '' },
      qualification: { type: String, trim: true, default: '' },
      profession: { type: String, trim: true, default: '' },
      officeAddress: { type: String, trim: true, default: '' },
      mobile: { type: String, trim: true, default: '' },
      mobileNumber: { type: String, trim: true, default: '' },
      email: { type: String, lowercase: true, trim: true, default: '' },
      emailId: { type: String, lowercase: true, trim: true, default: '' },
      aadhaarNo: { type: String, trim: true, default: '' },
      panNo: { type: String, uppercase: true, trim: true, default: '' },
      annualIncome: { type: String, trim: true, default: '' },
    },
    fatherName: {
      type: String,
      trim: true,
      default: '',
    },
    motherName: {
      type: String,
      trim: true,
      default: '',
    },
    primaryPhone: {
      type: String,
      required: [true, '10-digit primary mobile number is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
      index: true,
    },
    whatsappNumber: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit WhatsApp number'],
    },
    residentialVillage: {
      type: String,
      trim: true,
      default: 'Khanatti',
    },
    residentialAddress: {
      villageOrTown: { type: String, default: 'Khanatti', trim: true },
      taluk: { type: String, default: 'Mudalgi', trim: true },
      district: { type: String, default: 'Belagavi', trim: true },
      pincode: { type: String, default: '591312', trim: true },
    },

    // 3. Academic History & Karnataka State Identifiers (STS / PEN / APAAR)
    previousStudy: {
      schoolName: { type: String, trim: true, default: '' },
      schoolAddress: { type: String, trim: true, default: '' },
      affiliatedBoard: { type: String, trim: true, default: 'State Board (KSEAB)' },
      schoolAffiliatedTo: { type: String, trim: true, default: 'State Board (KSEAB)' },
      standardStudied: { type: String, trim: true, default: '' },
      mediumOfInstruction: { type: String, trim: true, default: 'English' },
      stsNumber: { type: String, trim: true, default: '', index: true },
      penNumber: { type: String, trim: true, default: '', index: true },
      apaarId: { type: String, trim: true, default: '', index: true },
    },

    // 4. Document Reference URLs & Enclosures Checklist
    documents: {
      studentPhotoUrl: { type: String, default: '' },
      birthCertificateUrl: { type: String, default: '' },
      studentAadhaarUrl: { type: String, default: '' },
      parentAadhaarUrl: { type: String, default: '' },
      previousTcUrl: { type: String, default: '' },
    },
    enclosuresSubmitted: {
      birthCertificate: { type: Boolean, default: false },
      studentAadhaar: { type: Boolean, default: false },
      parentAadhaar: { type: Boolean, default: false },
      transferCertificate: { type: Boolean, default: false },
      casteCertificate: { type: Boolean, default: false },
      passportPhotos: { type: Boolean, default: false },
    },
    declarationAccepted: {
      type: Boolean,
      default: true,
    },
    enrolledByStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // 5. Admission Fee Collection & Official Receipt Details
    feeDetails: {
      admissionFeeAmount: { type: Number, default: 500 },
      amountPaid: { type: Number, default: 0 },
      balanceDue: { type: Number, default: 0 },
      lastPaymentAmount: { type: Number, default: 0 },
      paymentStatus: {
        type: String,
        enum: ['Pending', 'Partial', 'Paid', 'Waived / Free Ship'],
        default: 'Pending',
        index: true,
      },
      paymentMethod: {
        type: String,
        enum: [
          'Cash',
          'Online_UPI',
          'Online_Card',
          'Bank_Transfer',
          'Cheque_DD',
          'Not_Applicable',
        ],
        default: 'Not_Applicable',
      },
      transactionId: { type: String, trim: true },
      orderId: { type: String, trim: true },
      receiptNumber: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        index: true,
      },
      paidAt: { type: Date },
      collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      collectedByStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      remarks: { type: String, trim: true },
      paymentHistory: [
        {
          receiptNumber: { type: String, trim: true },
          amountPaid: { type: Number, default: 0 },
          paymentMethod: { type: String, default: 'Cash' },
          transactionId: { type: String, trim: true },
          paidAt: { type: Date, default: Date.now },
          remarks: { type: String, trim: true },
        },
      ],
    },

    // Status
    status: {
      type: String,
      enum: ['Active', 'Enrolled', 'Pending Verification', 'Transferred', 'Alumni', 'Suspended'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

// Automatically synchronize flat and nested fields before validation
studentSchema.pre('validate', function (next) {
  // Sync Father name & phone
  if (this.father?.name && !this.fatherName) {
    this.fatherName = this.father.name;
  } else if (this.fatherName && (!this.father || !this.father.name)) {
    this.father = { ...(this.father || {}), name: this.fatherName };
  }

  const fatherPhone = this.father?.mobile || this.father?.mobileNumber || this.primaryPhone || '';
  if (fatherPhone) {
    if (!this.primaryPhone) this.primaryPhone = fatherPhone;
    if (this.father) {
      if (!this.father.mobile) this.father.mobile = fatherPhone;
      if (!this.father.mobileNumber) this.father.mobileNumber = fatherPhone;
    }
  }

  if (this.father?.email && !this.father.emailId) {
    this.father.emailId = this.father.email;
  } else if (this.father?.emailId && !this.father.email) {
    this.father.email = this.father.emailId;
  }

  // Sync Mother name & phone
  if (this.mother?.name && !this.motherName) {
    this.motherName = this.mother.name;
  } else if (this.motherName && (!this.mother || !this.mother.name)) {
    this.mother = { ...(this.mother || {}), name: this.motherName };
  }

  const motherPhone = this.mother?.mobile || this.mother?.mobileNumber || '';
  if (motherPhone && this.mother) {
    if (!this.mother.mobile) this.mother.mobile = motherPhone;
    if (!this.mother.mobileNumber) this.mother.mobileNumber = motherPhone;
  }

  if (this.mother?.email && !this.mother.emailId) {
    this.mother.emailId = this.mother.email;
  } else if (this.mother?.emailId && !this.mother.email) {
    this.mother.email = this.mother.emailId;
  }

  // Sync WhatsApp number
  if (!this.whatsappNumber && this.primaryPhone) {
    this.whatsappNumber = this.primaryPhone;
  }

  // Sync Residential Village & Address
  if (this.residentialAddress?.villageOrTown && !this.residentialVillage) {
    this.residentialVillage = this.residentialAddress.villageOrTown;
  } else if (this.residentialVillage && (!this.residentialAddress || !this.residentialAddress.villageOrTown)) {
    this.residentialAddress = {
      ...(this.residentialAddress || {}),
      villageOrTown: this.residentialVillage,
    };
  }

  // Sync Aadhaar & Medical & Transport aliases
  if (this.studentAadhaarNo && !this.aadhaarNumber) {
    this.aadhaarNumber = this.studentAadhaarNo;
  } else if (this.aadhaarNumber && !this.studentAadhaarNo) {
    this.studentAadhaarNo = this.aadhaarNumber;
  }

  if (this.medicalAilmentOrAllergy && !this.medicalAilmentsOrAllergies) {
    this.medicalAilmentsOrAllergies = this.medicalAilmentOrAllergy;
  } else if (this.medicalAilmentsOrAllergies && !this.medicalAilmentOrAllergy) {
    this.medicalAilmentOrAllergy = this.medicalAilmentsOrAllergies;
  }

  if (this.schoolTransportOptIn && !this.transportRequired) {
    this.transportRequired = true;
  } else if (this.transportRequired && !this.schoolTransportOptIn) {
    this.schoolTransportOptIn = true;
  }

  if (this.previousStudy?.schoolAffiliatedTo && !this.previousStudy.affiliatedBoard) {
    this.previousStudy.affiliatedBoard = this.previousStudy.schoolAffiliatedTo;
  } else if (this.previousStudy?.affiliatedBoard && !this.previousStudy.schoolAffiliatedTo) {
    this.previousStudy.schoolAffiliatedTo = this.previousStudy.affiliatedBoard;
  }

  // Auto-derive honorific from gender if not explicitly set
  if ((!this.honorific || this.honorific === 'None') && this.gender) {
    if (this.gender === 'Male') this.honorific = 'Master';
    else if (this.gender === 'Female') this.honorific = 'Kumari';
  }

  // Ensure empty receiptNumber is undefined so sparse unique index never collides
  if (this.feeDetails && !this.feeDetails.receiptNumber) {
    this.feeDetails.receiptNumber = undefined;
  }

  next();
});

// Compound index for fast grade roster and daily lookups
studentSchema.index({ grade: 1, section: 1, status: 1 });

module.exports = mongoose.model('Student', studentSchema);
