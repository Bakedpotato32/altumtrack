export const DEFAULT_SCHOOL = {
  isConfigured: false,
  name: '',
  tagline: 'Excellence in Modern Education',
  board: 'CBSE Affiliated',
  affiliationNo: '2130492',
  schoolCode: '65412',
  address: '',
  phone: '',
  email: '',
  principal: '',
  session: '2026-2027',
  examName: 'FINAL TERM EXAMINATION 2026',
  adminPin: '1234',
  logo: ''
};

export const DEFAULT_CLASSES = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export const DEFAULT_CLASS_SUBJECTS = {
  'Nursery': ['English', 'Rhymes', 'Mathematics', 'Drawing', 'General Knowledge'],
  'LKG':     ['English', 'Rhymes', 'Mathematics', 'Drawing', 'General Knowledge'],
  'UKG':     ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
  '1st':     ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
  '2nd':     ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer'],
  '3rd':     ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
  '4th':     ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
  '5th':     ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
  '6th':     ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  '7th':     ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  '8th':     ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  '9th':     ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'IT/Computer'],
  '10th':    ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'IT/Computer'],
  '11th':    ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'],
  '12th':    ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science']
};

export const DEFAULT_CO_SCHOLASTIC = [
  'Work Education & Skill',
  'Art & Cultural Education',
  'Health & Physical Education',
  'Discipline & Ethical Conduct'
];

export const DEFAULT_FEE_STRUCTURE = {
  'Nursery': { admissionFee: 5000, tuitionFee: 18000, examFee: 1500, annualCharges: 3500 },
  'LKG':     { admissionFee: 5000, tuitionFee: 18000, examFee: 1500, annualCharges: 3500 },
  'UKG':     { admissionFee: 5000, tuitionFee: 20000, examFee: 1500, annualCharges: 3500 },
  '1st':     { admissionFee: 6000, tuitionFee: 22000, examFee: 2000, annualCharges: 4000 },
  '2nd':     { admissionFee: 6000, tuitionFee: 22000, examFee: 2000, annualCharges: 4000 },
  '3rd':     { admissionFee: 6000, tuitionFee: 24000, examFee: 2000, annualCharges: 4000 },
  '4th':     { admissionFee: 6000, tuitionFee: 24000, examFee: 2000, annualCharges: 4000 },
  '5th':     { admissionFee: 7000, tuitionFee: 26000, examFee: 2500, annualCharges: 4500 },
  '6th':     { admissionFee: 7000, tuitionFee: 28000, examFee: 2500, annualCharges: 4500 },
  '7th':     { admissionFee: 7000, tuitionFee: 28000, examFee: 2500, annualCharges: 4500 },
  '8th':     { admissionFee: 7500, tuitionFee: 30000, examFee: 2500, annualCharges: 5000 },
  '9th':     { admissionFee: 8000, tuitionFee: 32000, examFee: 3000, annualCharges: 5000 },
  '10th':    { admissionFee: 8000, tuitionFee: 35000, examFee: 3500, annualCharges: 5500 },
  '11th':    { admissionFee: 10000, tuitionFee: 40000, examFee: 4000, annualCharges: 6000 },
  '12th':    { admissionFee: 10000, tuitionFee: 42000, examFee: 4500, annualCharges: 6500 },
};

// 100% Clean Slate: ZERO dummy records by default
export const INITIAL_STUDENTS = [];
