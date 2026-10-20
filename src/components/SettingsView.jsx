import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  School, CreditCard, BookOpen, ShieldCheck, Upload, Plus,
  Trash2, Save, CheckCircle2, RotateCcw, Download, Database
} from 'lucide-react';

export default function SettingsView({
  schoolInfo, setSchoolInfo,
  feeStructure, setFeeStructure,
  subjects, setSubjects,
  classes,
  students, setStudents,
  timetable, setTimetable,
  onLaunchWizard
}) {
  const [subTab, setSubTab] = useState('school'); // school | fees | exams | backup
  const [selectedFeeClass, setSelectedFeeClass] = useState('10th');
  const [newSubject, setNewSubject] = useState('');
  const [savedBanner, setSavedBanner] = useState('');

  const showToast = (msg) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(''), 2500);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSchoolInfo({ ...schoolInfo, logo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const currentClassFee = feeStructure[selectedFeeClass] || {
    admissionFee: 5000, tuitionFee: 25000, examFee: 2000, annualCharges: 3000
  };

  const updateClassFee = (field, val) => {
    setFeeStructure({
      ...feeStructure,
      [selectedFeeClass]: {
        ...currentClassFee,
        [field]: Number(val) || 0
      }
    });
  };

  const addSubject = (e) => {
    e.preventDefault();
    const trimmed = newSubject.trim();
    if (!trimmed || subjects.includes(trimmed)) return;
    setSubjects([...subjects, trimmed]);
    setNewSubject('');
  };

  const removeSubject = (sub) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter(s => s !== sub));
  };

  // Export entire ERP data as JSON file
  const handleExportBackup = () => {
    const payload = {
      version: 'Altumtrack-ERP-v2',
      exportedAt: new Date().toISOString(),
      schoolInfo,
      feeStructure,
      subjects,
      timetable,
      students
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `altumtrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup file downloaded to your phone!');
  };

  // Import JSON backup file
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.schoolInfo) setSchoolInfo(data.schoolInfo);
        if (data.feeStructure) setFeeStructure(data.feeStructure);
        if (data.subjects) setSubjects(data.subjects);
        if (data.timetable) setTimetable(data.timetable);
        if (data.students) setStudents(data.students);
        showToast('Database Restored Successfully!');
      } catch {
        showToast('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      {/* Settings Category Selector */}
      <div className="p-2 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg grid grid-cols-4 gap-1.5">
        {[
          { id: 'school', label: 'School', icon: School },
          { id: 'fees', label: 'Fees', icon: CreditCard },
          { id: 'exams', label: 'Subjects', icon: BookOpen },
          { id: 'backup', label: 'Backup', icon: Database }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center justify-center gap-1 py-2.5 px-2 rounded-2xl text-xs font-extrabold transition ${
                subTab === t.id
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {savedBanner && (
        <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4" /> {savedBanner}
        </div>
      )}

      {/* 1. SCHOOL PROFILE */}
      {subTab === 'school' && (
        <div className="p-5 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">School Profile & Branding</h3>
              <p className="text-slate-500">Shown on Admit Cards, Report Cards, Certificates & Receipts</p>
            </div>
            <button
              onClick={onLaunchWizard}
              className="px-3 py-1.5 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Wizard
            </button>
          </div>

          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            {schoolInfo.logo ? (
              <img src={schoolInfo.logo} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border border-violet-200" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-700 font-black flex items-center justify-center">
                LOGO
              </div>
            )}
            <div className="space-y-1">
              <p className="font-bold text-slate-800">Official School Crest</p>
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-400 uppercase">School Name</label>
              <input
                type="text"
                value={schoolInfo.name}
                onChange={e => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-400 uppercase">Campus Address</label>
              <input
                type="text"
                value={schoolInfo.address}
                onChange={e => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 uppercase">Board / Affiliation</label>
              <input
                type="text"
                value={schoolInfo.board}
                onChange={e => setSchoolInfo({ ...schoolInfo, board: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 uppercase">Affiliation Number</label>
              <input
                type="text"
                value={schoolInfo.affiliationNo}
                onChange={e => setSchoolInfo({ ...schoolInfo, affiliationNo: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 uppercase">Principal Name</label>
              <input
                type="text"
                value={schoolInfo.principal}
                onChange={e => setSchoolInfo({ ...schoolInfo, principal: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 uppercase">Phone Helpline</label>
              <input
                type="text"
                value={schoolInfo.phone}
                onChange={e => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>
          </div>

          <button
            onClick={() => showToast('School Profile Saved!')}
            className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save School Profile
          </button>
        </div>
      )}

      {/* 2. CLASS-WISE FEE STRUCTURE */}
      {subTab === 'fees' && (
        <div className="p-5 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-slate-800">Class-Wise Fee Structure</h3>
            <p className="text-slate-500">Automatically sets total fees during New Student Admission</p>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {classes.map(c => (
              <button
                key={c}
                onClick={() => setSelectedFeeClass(c)}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition ${
                  selectedFeeClass === c ? 'bg-violet-600 text-white shadow' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="font-bold text-slate-500 uppercase">Admission Fee (₹)</label>
              <input
                type="number"
                value={currentClassFee.admissionFee}
                onChange={e => updateClassFee('admissionFee', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Annual Tuition (₹)</label>
              <input
                type="number"
                value={currentClassFee.tuitionFee}
                onChange={e => updateClassFee('tuitionFee', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Exam Fee (₹)</label>
              <input
                type="number"
                value={currentClassFee.examFee}
                onChange={e => updateClassFee('examFee', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Annual Charges (₹)</label>
              <input
                type="number"
                value={currentClassFee.annualCharges}
                onChange={e => updateClassFee('annualCharges', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 uppercase">Total Package for Class {selectedFeeClass}</p>
              <p className="text-xs text-emerald-600">Auto-applied to new {selectedFeeClass} admissions</p>
            </div>
            <span className="text-xl font-black text-emerald-700">
              ₹{(currentClassFee.admissionFee + currentClassFee.tuitionFee + currentClassFee.examFee + currentClassFee.annualCharges).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 3. SUBJECTS & SECURITY PIN */}
      {subTab === 'exams' && (
        <div className="p-5 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg space-y-5 text-xs">
          <div>
            <h3 className="text-base font-black text-slate-800">Exam Subjects & Admin PIN</h3>
            <p className="text-slate-500">Add or remove school subjects and update your 4-digit security lock</p>
          </div>

          <form onSubmit={addSubject} className="flex gap-2">
            <input
              type="text"
              placeholder="Add subject (e.g. Hindi, Physics, Sanskrit)..."
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
            />
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {subjects.map(sub => (
              <div key={sub} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-700">
                <span>{sub}</span>
                <button onClick={() => removeSubject(sub)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <label className="font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin Lock Screen PIN (4 Digits)
            </label>
            <input
              type="text"
              maxLength={4}
              value={schoolInfo.adminPin}
              onChange={e => setSchoolInfo({ ...schoolInfo, adminPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              className="w-36 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-base tracking-widest text-center"
            />
          </div>
        </div>
      )}

      {/* 4. BACKUP & RESTORE DATABASE */}
      {subTab === 'backup' && (
        <div className="p-5 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-slate-800">Backup & Restore ERP Database</h3>
            <p className="text-slate-500">Save all student records, fee ledgers, and timetables to your phone</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportBackup}
              className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold flex flex-col items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-6 h-6" />
              <span>Export Full Backup (.JSON)</span>
              <span className="text-[10px] text-white/80 font-normal">{students.length} Students & All Settings</span>
            </button>

            <label className="p-4 rounded-2xl bg-slate-900 text-white font-bold flex flex-col items-center justify-center gap-2 shadow-lg cursor-pointer">
              <Upload className="w-6 h-6 text-emerald-400" />
              <span>Restore from Backup File</span>
              <span className="text-[10px] text-slate-400 font-normal">Select a saved .json file</span>
              <input type="file" accept=".json,application/json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </motion.div>
  );
}
