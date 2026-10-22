export const DEFAULT_SCHOOL = {
  isConfigured: false,
  name: 'ALTUM INTERNATIONAL ACADEMY',
  tagline: 'Excellence in Modern Education',
  board: 'CBSE Affiliated',
  affiliationNo: '2130492',
  schoolCode: '65412',
  address: 'Sector 14, Knowledge Park, New Delhi',
  phone: '9876543210',
  email: 'admin@altumacademy.edu.in',
  principal: 'Dr. R. K. Sharma',
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

export const INITIAL_STUDENTS = [
  {
    id: 'ALT-2026-001',
    name: 'Aarav Sharma',
    rollNo: '101',
    className: '10th',
    section: 'A',
    gender: 'Male',
    dob: '2010-05-14',
    age: '16',
    bloodGroup: 'O+',
    studentAadhar: '4589-2310-8891',
    parentName: 'Rajesh Sharma',
    motherName: 'Sunita Sharma',
    parentAadhar: '7741-9902-1123',
    phone: '9876543210',
    address: 'Sector 14, Green Park',
    busRoute: 'Route 4 - City Center',
    totalFee: 52000,
    paidFee: 52000,
    avatarColor: 'from-violet-500 to-fuchsia-500',
    teacherRemarks: 'Exceptional academic dedication and sharp analytical thinking.',
    coScholastic: {
      'Work Education & Skill': 'A',
      'Art & Cultural Education': 'A',
      'Health & Physical Education': 'A',
      'Discipline & Ethical Conduct': 'A'
    },
    marks: { 'Mathematics': 95, 'Science': 92, 'Social Science': 90, 'English': 88, 'Hindi': 90, 'IT/Computer': 98 }
  },
  {
    id: 'ALT-2026-002',
    name: 'Ananya Verma',
    rollNo: '102',
    className: '10th',
    section: 'A',
    gender: 'Female',
    dob: '2010-08-22',
    age: '15',
    bloodGroup: 'B+',
    studentAadhar: '6621-4390-5512',
    parentName: 'Vikram Verma',
    motherName: 'Pooja Verma',
    parentAadhar: '8812-3349-0019',
    phone: '9812345678',
    address: '42 Sunrise Avenue',
    busRoute: 'Route 1 - North Campus',
    totalFee: 52000,
    paidFee: 32000,
    avatarColor: 'from-cyan-500 to-blue-500',
    teacherRemarks: 'Active participant in discussions with strong language command.',
    coScholastic: {
      'Work Education & Skill': 'A',
      'Art & Cultural Education': 'A',
      'Health & Physical Education': 'B',
      'Discipline & Ethical Conduct': 'A'
    },
    marks: { 'Mathematics': 84, 'Science': 89, 'Social Science': 86, 'English': 94, 'Hindi': 88, 'IT/Computer': 91 }
  }
];
