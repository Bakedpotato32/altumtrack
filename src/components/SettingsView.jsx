import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  School, CreditCard, BookOpen, ShieldCheck, Upload, Plus,
  Trash2, Save, CheckCircle2, RotateCcw, Download, Database, Sparkles, Sliders, Lock
} from 'lucide-react';
import { generateMegaDemoData } from '../utils/demoGenerator';

export default function SettingsView({
  schoolInfo, setSchoolInfo,
  feeStructure, setFeeStructure,
  classSubjects, setClassSubjects,
  subjects, setSubjects,
  classes,
  students, setStudents,
  timetable, setTimetable,
  setStaffList,
  setExpenseList,
  setFeeLogs,
  setSalaryPayouts,
  onLaunchWizard,
  onOpenCurriculumModal
}) {
  const [subTab, setSubTab] = useState('school'); // school | fees | curriculum | database
  const [selectedFeeClass, setSelectedFeeClass] = useState('10th');
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

  // Quick Fee Tier Presets
  const applyFeePreset = (adm, tui, exm, ann) => {
    setFeeStructure({
      ...feeStructure,
      [selectedFeeClass]: {
        admissionFee: adm,
        tuitionFee: tui,
        examFee: exm,
        annualCharges: ann
      }
    });
    showToast(`Applied preset to Class ${selectedFeeClass}!`);
  };

  // Export full system JSON backup
  const handleExportBackup = () => {
    const payload = {
      version: 'Altumtrack-ERP-v2',
      exportedAt: new Date().toISOString(),
      schoolInfo,
      feeStructure,
      classSubjects,
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
    showToast('Full Backup Downloaded Successfully!');
  };

  // Restore from JSON backup
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.schoolInfo) setSchoolInfo(data.schoolInfo);
        if (data.feeStructure) setFeeStructure(data.feeStructure);
        if (data.classSubjects) setClassSubjects(data.classSubjects);
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

  const handleTriggerMegaDemo = () => {
    if (window.confirm('Populate 50 students per class (750 total) + staff & expenses for testing?')) {
      const demo = generateMegaDemoData(feeStructure, classSubjects || {});
      setStudents(demo.students);
      if (setStaffList) setStaffList(demo.staffList);
      if (setExpenseList) setExpenseList(demo.expenseList);
      if (setFeeLogs) setFeeLogs(demo.feeLogs);
      if (setSalaryPayouts) setSalaryPayouts(demo.salaryPayouts);
      showToast('Loaded 50 Students/Class + Staff & Expenses!');
    }
  };

  const handleWipeDatabase = () => {
    if (window.confirm('Wipe ALL student, staff, fee, and expense records back to 0 (Clean Slate)?')) {
      setStudents([]);
      if (setStaffList) setStaffList([]);
      if (setExpenseList) setExpenseList([]);
      if (setFeeLogs) setFeeLogs([]);
      if (setSalaryPayouts) setSalaryPayouts([]);
      showToast('Database completely wiped! 0 records.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      {/* Settings Navigation Bar */}
      <div className="p-1.5 rounded-[22px] glass-dock grid grid-cols-4 gap-1.5">
        {[
          { id: 'school', label: 'School', icon: School },
          { id: 'fees', label: 'Fee Packages', icon: CreditCard },
          { id: 'curriculum', label: 'Curriculum', icon: Sliders },
          { id: 'database', label: 'Database', icon: Database }
        ].map(t => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-black transition ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {savedBanner && (
        <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4" /> {savedBanner}
        </div>
      )}

      {/* 1. SCHOOL PROFILE */}
      {subTab === 'school' && (
        <div className="p-5 sm:p-6 rounded-[28px] glass-card space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Official Institution Branding</h3>
              <p className="text-slate-500 font-medium">Rendered across all official certificates, admit cards & receipts</p>
            </div>
            <button
              onClick={onLaunchWizard}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center gap-1 border border-blue-200/80"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Launch Setup
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 border border-slate-200">
            {schoolInfo.logo ? (
              <img src={schoolInfo.logo} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                CREST
              </div>
            )}
            <div className="space-y-1.5">
              <p className="font-black text-slate-900">School Crest & Emblem</p>
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-black cursor-pointer shadow-sm active:scale-95 transition">
                <Upload className="w-3.5 h-3.5" /> Upload Image
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-500 uppercase">Official School Name *</label>
              <input
                type="text"
                value={schoolInfo.name}
                onChange={e => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200 font-black text-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-500 uppercase">Campus Address *</label>
              <input
                type="text"
                value={schoolInfo.address}
                onChange={e => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Principal Name (Signatory)</label>
              <input
                type="text"
                value={schoolInfo.principal}
                onChange={e => setSchoolInfo({ ...schoolInfo, principal: e.target.value })}
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/80 border border-slate-200 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase">Phone Helpline</label>
              <input
                type="text"
                value={schoolInfo.phone}
                onChange={e => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/80 border border-slate-200 font-semibold"
              />
            </div>
          </div>

          <button
            onClick={() => showToast('School Profile Saved!')}
            className="w-full py-3 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
          >
            <Save className="w-4 h-4 text-emerald-400" /> Save Profile Changes
          </button>
        </div>
      )}

      {/* 2. CLASS FEE STRUCTURE */}
      {subTab === 'fees' && (
        <div className="p-5 sm:p-6 rounded-[28px] glass-card space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-slate-900">Class Fee Packages</h3>
            <p className="text-slate-500 font-medium">Applied automatically to new student enrollments</p>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {classes.map(c => (
              <button
                key={c}
                onClick={() => setSelectedFeeClass(c)}
                className={`px-3 py-1.5 rounded-xl font-black shrink-0 transition ${
                  selectedFeeClass === c
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white/80 text-slate-600 border border-slate-200'
                }`}
              >
                Class {c}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Apply Tier Preset:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => applyFeePreset(5000, 20000, 1500, 3500)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]"
              >
                Primary (₹30k)
              </button>
              <button
                type="button"
                onClick={() => applyFeePreset(7000, 28000, 2500, 4500)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]"
              >
                Middle (₹42k)
              </button>
              <button
                type="button"
                onClick={() => applyFeePreset(10000, 40000, 4000, 6000)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]"
              >
                Senior (₹60k)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/70 border border-slate-200">
            <div>
              <label className="font-black text-slate-500 uppercase text-[10px]">Admission Fee (₹)</label>
              <input
                type="number"
                value={currentClassFee.admissionFee}
                onChange={e => updateClassFee('admissionFee', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
              />
            </div>
            <div>
              <label className="font-black text-slate-500 uppercase text-[10px]">Annual Tuition Fee (₹)</label>
              <input
                type="number"
                value={currentClassFee.tuitionFee}
                onChange={e => updateClassFee('tuitionFee', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
              />
            </div>
            <div>
              <label className="font-black text-slate-500 uppercase text-[10px]">Exam & Lab Fee (₹)</label>
              <input
                type="number"
                value={currentClassFee.examFee}
                onChange={e => updateClassFee('examFee', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
              />
            </div>
            <div>
              <label className="font-black text-slate-500 uppercase text-[10px]">Development Charges (₹)</label>
              <input
                type="number"
                value={currentClassFee.annualCharges}
                onChange={e => updateClassFee('annualCharges', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. CURRICULUM ARCHITECT & PIN */}
      {subTab === 'curriculum' && (
        <div className="p-5 sm:p-6 rounded-[28px] glass-card space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-slate-900">Curriculum & Exam Term Configuration</h3>
            <p className="text-slate-500 font-medium">Manage subject mappings, exam titles & individual maximum marks</p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white space-y-2.5 shadow-md">
            <h4 className="font-black text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" /> Curriculum & Exam Architect
            </h4>
            <p className="text-[11px] text-white/85">
              Configure custom subjects per class, create custom exam terms (like Unit Test 1 or Finals), and configure Max/Pass Marks for every subject.
            </p>
            <button
              type="button"
              onClick={onOpenCurriculumModal}
              className="mt-1 px-4 py-2 rounded-xl bg-white text-blue-700 font-black text-xs shadow active:scale-95 transition"
            >
              Open Curriculum Architect →
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <label className="font-black text-slate-700 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin Lock Screen PIN (4 Digits)
            </label>
            <input
              type="text"
              maxLength={4}
              value={schoolInfo.adminPin || '1234'}
              onChange={e => setSchoolInfo({ ...schoolInfo, adminPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              className="w-36 px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200 font-black text-base tracking-[0.5em] text-center"
            />
          </div>
        </div>
      )}

      {/* 4. DATABASE & DEMO TOOLS */}
      {subTab === 'database' && (
        <div className="p-5 sm:p-6 rounded-[28px] glass-card space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-slate-900">Database & System Storage</h3>
            <p className="text-slate-500 font-medium">Currently storing <b>{students.length} Student Profiles</b></p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-3">
            <h4 className="font-black text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Demo & Data Reset Controls
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleTriggerMegaDemo}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Load 50 Students/Class Demo
              </button>
              <button
                type="button"
                onClick={handleWipeDatabase}
                className="py-2.5 px-3 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center gap-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" /> Wipe Database (0 Students)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleExportBackup}
              className="p-4 rounded-2xl bg-slate-900 text-white font-black flex flex-col items-center justify-center gap-1.5 shadow"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              <span>Download JSON Backup</span>
            </button>

            <label className="p-4 rounded-2xl bg-white/80 border border-slate-200 text-slate-800 font-black flex flex-col items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Restore from Backup File</span>
              <input type="file" accept=".json,application/json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </motion.div>
  );
}
