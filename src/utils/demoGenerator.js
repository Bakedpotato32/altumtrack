const MALE_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Krishna", "Ishan",
  "Shaurya", "Atharv", "Kabir", "Rohan", "Aryan", "Dhruv", "Devansh", "Rudra",
  "Ayush", "Harsh", "Om", "Manish", "Kunal", "Yash", "Samar", "Alok", "Vikram",
  "Tushar", "Nikhil", "Gaurav", "Rahul", "Abhishek", "Sachin", "Deepak", "Amit",
  "Siddharth", "Pranav", "Varun", "Mayank", "Aniket", "Kartik", "Shivam"
];

const FEMALE_NAMES = [
  "Aadhya", "Diya", "Saanvi", "Ananya", "Pari", "Riya", "Anvi", "Sneha",
  "Ishita", "Kavya", "Priya", "Meera", "Pooja", "Simran", "Neha", "Tanya",
  "Nisha", "Swati", "Khushi", "Rani", "Shreya", "Aditi", "Bhavya", "Tanvi",
  "Avani", "Isha", "Mansi", "Divya", "Komal", "Ritu", "Sonali", "Jyoti",
  "Monika", "Payal", "Sakshi", "Kritika", "Preeti", "Garima", "Shalini", "Rashmi"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Singh", "Patel", "Yadav", "Gupta", "Das", "Nair",
  "Mishra", "Kumar", "Chauhan", "Joshi", "Bose", "Ghosh", "Reddy", "Mehta",
  "Malhotra", "Pandey", "Saxena", "Choudhury", "Bhatt", "Trivedi", "Rawat", "Agarwal"
];

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const BUS_ROUTES = [
  'Route 1 - North Campus',
  'Route 2 - Sector 14 Metro',
  'Route 3 - City Center Mall',
  'Route 4 - Green Park Colony',
  'Self / Walker'
];

const AVATAR_GRADIENTS = [
  'from-violet-500 to-fuchsia-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500'
];

export function generateMegaDemoData(feeStructure, classSubjects) {
  const classes = Object.keys(feeStructure);
  const students = [];
  const feeLogs = [];
  let globalStudentCounter = 1;

  classes.forEach((className) => {
    const classFeeObj = feeStructure[className] || {
      admissionFee: 6000, tuitionFee: 25000, examFee: 2000, annualCharges: 3500
    };
    const totalPkg =
      classFeeObj.admissionFee +
      classFeeObj.tuitionFee +
      classFeeObj.examFee +
      classFeeObj.annualCharges;

    const subjectsForClass = classSubjects[className] || ['Mathematics', 'Science', 'English', 'Social Science', 'Computer'];

    // Generate 50 students for THIS class
    for (let i = 1; i <= 50; i++) {
      const isFemale = i % 2 === 0;
      const firstNameList = isFemale ? FEMALE_NAMES : MALE_NAMES;
      const firstName = firstNameList[(i + globalStudentCounter) % firstNameList.length];
      const lastName = LAST_NAMES[(i * 3 + globalStudentCounter) % LAST_NAMES.length];
      const fullName = `${firstName} ${lastName}`;
      const fatherName = `${MALE_NAMES[(i * 2) % MALE_NAMES.length]} ${lastName}`;
      const motherName = `${FEMALE_NAMES[(i * 2 + 1) % FEMALE_NAMES.length]} ${lastName}`;
      const rollNo = String(100 + i);
      const section = i <= 25 ? 'A' : 'B';
      const studentId = `ALT-2026-${String(globalStudentCounter).padStart(4, '0')}`;
      const phone = `98${String(10000000 + (globalStudentCounter * 73) % 89999999)}`;
      const studentAadhar = `${String(1000 + (globalStudentCounter * 17) % 8999)}-${String(2000 + (globalStudentCounter * 31) % 7999)}-${String(3000 + (globalStudentCounter * 43) % 6999)}`;
      const parentAadhar = `${String(5000 + (globalStudentCounter * 13) % 4999)}-${String(6000 + (globalStudentCounter * 23) % 3999)}-${String(7000 + (globalStudentCounter * 29) % 2999)}`;
      const bloodGroup = BLOOD_GROUPS[i % BLOOD_GROUPS.length];
      const busRoute = BUS_ROUTES[i % BUS_ROUTES.length];

      // Varied fee payment scenarios
      let paidFee = totalPkg; // default: paid in full
      if (i % 7 === 0) {
        paidFee = Math.round(totalPkg * 0.4); // partial due
      } else if (i % 11 === 0) {
        paidFee = 0; // complete defaulter
      } else if (i % 5 === 0) {
        paidFee = Math.round(totalPkg * 0.75); // partial
      }

      if (paidFee > 0) {
        feeLogs.push({
          id: `LOG-${globalStudentCounter}-1`,
          studentId,
          amount: paidFee,
          remark: 'Initial Term Fee Payment via UPI',
          date: '2026-10-01T10:00:00.000Z'
        });
      }

      // Generate realistic marks
      const marks = {};
      subjectsForClass.forEach((sub, sIdx) => {
        // Vary marks: top students get 90+, average 60-85, occasional low score
        let baseScore = 75 + ((i * 7 + sIdx * 11) % 23);
        if (i <= 5) baseScore = 92 + (sIdx % 7); // toppers
        if (i === 48) baseScore = 32; // retest student
        marks[sub] = Math.min(100, Math.max(25, baseScore));
      });

      students.push({
        id: studentId,
        name: fullName,
        rollNo,
        className,
        section,
        gender: isFemale ? 'Female' : 'Male',
        dob: '2010-06-15',
        age: '16',
        bloodGroup,
        studentAadhar,
        parentName: fatherName,
        motherName,
        parentAadhar,
        phone,
        address: `Flat #${100 + i}, Tower ${section}, Green View Heights`,
        busRoute,
        totalFee: totalPkg,
        paidFee,
        avatarColor: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
        teacherRemarks: i <= 5 ? 'Exceptional academic dedication and leadership.' : 'Regular and attentive student.',
        coScholastic: {
          'Work Education & Skill': i % 3 === 0 ? 'B' : 'A',
          'Art & Cultural Education': 'A',
          'Health & Physical Education': i % 4 === 0 ? 'B' : 'A',
          'Discipline & Ethical Conduct': 'A'
        },
        marks
      });

      globalStudentCounter++;
    }
  });

  const staffList = [
    { id: 'STF-101', name: 'Dr. Sanjay Kumar', role: 'Teacher', subject: 'Mathematics', phone: '9876501234', salary: 38000, joinDate: '2022-04-01' },
    { id: 'STF-102', name: 'Meenakshi Joshi', role: 'Teacher', subject: 'Physics & Science', phone: '9812309876', salary: 35000, joinDate: '2023-06-15' },
    { id: 'STF-103', name: 'Anuradha Sen', role: 'Teacher', subject: 'English Literature', phone: '9765431209', salary: 34000, joinDate: '2023-08-01' },
    { id: 'STF-104', name: 'Virendra Singh', role: 'Sports Coach', subject: 'Physical Education', phone: '9899112233', salary: 26000, joinDate: '2024-01-10' },
    { id: 'STF-105', name: 'Ram Dayal', role: 'Bus Driver', subject: 'Route 1 & 4', phone: '9988771122', salary: 19000, joinDate: '2023-08-10' }
  ];

  const expenseList = [
    { id: 'EXP-1', title: 'October Campus Electricity & Water', category: 'Electricity & Water', amount: 9400, date: '2026-10-10', paymentMode: 'UPI / QR' },
    { id: 'EXP-2', title: 'Bus Diesel & Service (Routes 1-4)', category: 'Bus Diesel & Maintenance', amount: 14500, date: '2026-10-14', paymentMode: 'Bank Transfer' },
    { id: 'EXP-3', title: 'Examination Answer Sheets Printing', category: 'Exam Papers & Stationery', amount: 5600, date: '2026-10-18', paymentMode: 'Cash' }
  ];

  const salaryPayouts = [
    { id: 'PAY-1', staffId: 'STF-101', staffName: 'Dr. Sanjay Kumar', role: 'Teacher', phone: '9876501234', month: 'September 2026', baseSalary: 38000, bonus: 2000, deductions: 0, netAmount: 40000, paymentMode: 'Bank Transfer', date: '2026-10-01', slipNo: 'SLIP-8910' }
  ];

  return { students, staffList, expenseList, feeLogs, salaryPayouts };
}
