import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Upload, Shield, Calendar, Award, CheckCircle2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

const AVATAR_GRADIENTS = [
  'from-violet-500 to-fuchsia-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500'
];

export default function AdmissionDesk({ classes, feeStructure, subjects, onSaveStudent, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    rollNo: '',
    className: '10th',
    section: 'A',
    gender: 'Male',
    dob: '2010-01-01',
    bloodGroup: 'O+',
    studentAadhar: '',
    parentName: '',
    motherName: '',
    parentAadhar: '',
    phone: '',
    address: '',
    previousSchool: '',
    previousGrade: '',
    tcNo: '',
    busRoute: 'Route 1 - North Campus',
    paidFee: 0,
    photo: ''
  });

  // Calculate age from DOB
  const calculateAge = (dobString) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? String(age) : '15';
  };

  // Get total fee for selected class from settings
  const currentClassFees = feeStructure[form.className] || {
    admissionFee: 8000, tuitionFee: 35000, examFee: 3500, annualCharges: 5500
  };
  const computedTotalFee = currentClassFees.admissionFee + currentClassFees.tuitionFee + currentClassFees.examFee + currentClassFees.annualCharges;

  // Format Aadhar input: XXXX-XXXX-XXXX
  const handleAadharChange = (field, val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    let formatted = raw;
    if (raw.length > 4 && raw.length <= 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    } else if (raw.length > 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
    }
    setForm({ ...form, [field]: formatted });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.rollNo) return;

    const nextNum = String(Math.floor(Math.random() * 900) + 100);
    const defaultMarks = {};
    subjects.forEach(sub => { defaultMarks[sub] = 80; });

    const newStudent = {
      ...form,
      id: `ALT-2026-${nextNum}`,
      age: calculateAge(form.dob),
      totalFee: computedTotalFee,
      paidFee: Number(form.paidFee) || 0,
      avatarColor: AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)],
      marks: defaultMarks
    };

    onSaveStudent(newStudent);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-4 pb-12"
    >
      <div className="flex items-center justify-between p-4 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base sm:text-lg text-slate-800">Student Admission Desk</h2>
            <p className="text-xs text-slate-500">Register new admissions, Aadhaar records & initial fees</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SECTION 1: Personal & Photo */}
        <div className="p-5 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b pb-2">
            <Award className="w-4 h-4 text-violet-600" /> 1. Personal & Identity Details
          </h3>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            {form.photo ? (
              <img src={form.photo} alt="Student" className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-700 font-black flex items-center justify-center text-sm">
                PHOTO
              </div>
            )}
            <div>
              <p className="font-bold text-slate-800">Student Passport Photo</p>
              <p className="text-[10px] text-slate-400 mb-2">Used for ID cards & Admit cards</p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload Image
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-500 uppercase">Full Student Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Rohan Malhotra"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Roll Number *</label>
              <input
                required
                type="text"
                placeholder="e.g. 104"
                value={form.rollNo}
                onChange={e => setForm({ ...form, rollNo: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Class & Section *</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={form.className}
                  onChange={e => setForm({ ...form, className: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                >
                  {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select
                  value={form.section}
                  onChange={e => setForm({ ...form, section: e.target.value })}
                  className="w-20 px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                >
                  {['A', 'B', 'C'].map(s => <option key={s} value={s}>Sec {s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Date of Birth</label>
              <input
                type="date"
                value={form.dob}
                onChange={e => setForm({ ...form, dob: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-500 uppercase">Student Aadhaar Number</label>
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX"
                value={form.studentAadhar}
                onChange={e => handleAadharChange('studentAadhar', e.target.value)}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Gender</label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              >
                {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Parents & Contact */}
        <div className="p-5 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b pb-2">
            <Shield className="w-4 h-4 text-emerald-600" /> 2. Parent / Guardian & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-500 uppercase">Father's Name</label>
              <input
                type="text"
                placeholder="e.g. Suresh Malhotra"
                value={form.parentName}
                onChange={e => setForm({ ...form, parentName: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Mother's Name</label>
              <input
                type="text"
                placeholder="e.g. Anita Malhotra"
                value={form.motherName}
                onChange={e => setForm({ ...form, motherName: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Parent Aadhaar Number</label>
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX"
                value={form.parentAadhar}
                onChange={e => handleAadharChange('parentAadhar', e.target.value)}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Emergency Contact Phone *</label>
              <input
                required
                type="text"
                placeholder="9876543210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-500 uppercase">Residential Address</label>
              <input
                type="text"
                placeholder="House No, Street, City"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Previous School & Fees */}
        <div className="p-5 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b pb-2">
            <Calendar className="w-4 h-4 text-amber-600" /> 3. Previous School & Fee Package
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-500 uppercase">Previous School Name</label>
              <input
                type="text"
                placeholder="e.g. St. Mary Public"
                value={form.previousSchool}
                onChange={e => setForm({ ...form, previousSchool: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Previous Grade & Marks</label>
              <input
                type="text"
                placeholder="e.g. 9th (88%)"
                value={form.previousGrade}
                onChange={e => setForm({ ...form, previousGrade: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Transfer Certificate (TC No.)</label>
              <input
                type="text"
                placeholder="e.g. TC/2026/894"
                value={form.tcNo}
                onChange={e => setForm({ ...form, tcNo: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 uppercase">Auto-Calculated Total Fee for Class {form.className}</p>
              <p className="text-xs text-emerald-600">Based on Admission, Tuition, Exam & Annual settings</p>
            </div>
            <span className="text-2xl font-black text-emerald-700">₹{computedTotalFee.toLocaleString()}</span>
          </div>

          <div>
            <label className="font-bold text-slate-500 uppercase">Initial Admission Fee Paid Now (₹)</label>
            <input
              type="number"
              value={form.paidFee}
              onChange={e => setForm({ ...form, paidFee: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-extrabold text-sm text-emerald-700"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 text-white font-black text-sm shadow-xl shadow-violet-500/30 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" /> Complete Admission & Enroll Student
        </button>
      </form>
    </motion.div>
  );
}
