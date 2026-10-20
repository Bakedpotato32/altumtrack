import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CreditCard, Award, FileSpreadsheet,
  Search, Printer, AlertCircle, Sparkles,
  GraduationCap, Lock, Settings, UserPlus, X, MessageCircle, Eye, Download, Image, History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DEFAULT_SCHOOL, DEFAULT_CLASSES, DEFAULT_FEE_STRUCTURE,
  DEFAULT_SUBJECTS, INITIAL_STUDENTS
} from './defaultData';
import { SetupWizard, LoginScreen } from './components/OnboardingAndAuth';
import SettingsView from './components/SettingsView';
import AdmissionDesk from './components/AdmissionDesk';
import ExamManager from './components/ExamManager';
import StudentDetailModal from './components/StudentDetailModal';
import FeeManagerModal from './components/FeeManagerModal';
import AuditCenterModal from './components/AuditCenterModal';
import ClassPromotionModal from './components/ClassPromotionModal';
import {
  exportElementAsPNG,
  exportElementAsPDF,
  shareElementToWhatsApp
} from './utils/exportHelper';

export default function App() {
  const [schoolInfo, setSchoolInfo] = useState(() => {
    const saved = localStorage.getItem('altumtrack_school_v2');
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL;
  });

  const [feeStructure, setFeeStructure] = useState(() => {
    const saved = localStorage.getItem('altumtrack_fees_v2');
    return saved ? JSON.parse(saved) : DEFAULT_FEE_STRUCTURE;
  });

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('altumtrack_subjects_v2');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('altumtrack_timetable_v1');
    return saved ? JSON.parse(saved) : {};
  });

  const [examConfig, setExamConfig] = useState(() => {
    const saved = localStorage.getItem('altumtrack_examcfg_v1');
    return saved ? JSON.parse(saved) : { maxMarks: 100, passMarks: 33 };
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('altumtrack_students_v1');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [trashedStudents, setTrashedStudents] = useState(() => {
    const saved = localStorage.getItem('altumtrack_trash_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [feeLogs, setFeeLogs] = useState(() => {
    const saved = localStorage.getItem('altumtrack_feelogs_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('altumtrack_audit_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [forceWizard, setForceWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [feeFilterStatus, setFeeFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailModalStudent, setDetailModalStudent] = useState(null);
  const [feeManagerStudent, setFeeManagerStudent] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [studioMode, setStudioMode] = useState('admit');
  const [receiptModalStudent, setReceiptModalStudent] = useState(null);
  const [exportingStatus, setExportingStatus] = useState('');

  const studioRef = useRef(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('altumtrack_school_v2', JSON.stringify(schoolInfo));
  }, [schoolInfo]);

  useEffect(() => {
    localStorage.setItem('altumtrack_fees_v2', JSON.stringify(feeStructure));
  }, [feeStructure]);

  useEffect(() => {
    localStorage.setItem('altumtrack_subjects_v2', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('altumtrack_timetable_v1', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('altumtrack_examcfg_v1', JSON.stringify(examConfig));
  }, [examConfig]);

  useEffect(() => {
    localStorage.setItem('altumtrack_students_v1', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('altumtrack_trash_v1', JSON.stringify(trashedStudents));
  }, [trashedStudents]);

  useEffect(() => {
    localStorage.setItem('altumtrack_feelogs_v1', JSON.stringify(feeLogs));
  }, [feeLogs]);

  useEffect(() => {
    localStorage.setItem('altumtrack_audit_v1', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const recordAudit = (type, description, undoPayload = null) => {
    const entry = {
      id: 'AUD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type,
      description,
      timestamp: new Date().toISOString(),
      canUndo: Boolean(undoPayload),
      undoPayload,
      undone: false
    };
    setAuditLogs(prev => [entry, ...prev.slice(0, 99)]);
  };

  const handleUndoAction = (auditItem) => {
    const { type, undoPayload } = auditItem;
    if (!undoPayload) return;

    if (type === 'FEE_PAID') {
      const { studentId, amount, feeLogId } = undoPayload;
      setFeeLogs(prev => prev.filter(l => l.id !== feeLogId));
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, paidFee: Math.max(0, Number(s.paidFee) - amount) } : s
      ));
    } else if (type === 'FEE_REVERT') {
      const { restoredLog, studentId, amount } = undoPayload;
      setFeeLogs(prev => [restoredLog, ...prev]);
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, paidFee: Math.min(s.totalFee, Number(s.paidFee) + amount) } : s
      ));
    } else if (type === 'PROFILE_EDIT') {
      const { previousStudent } = undoPayload;
      setStudents(prev => prev.map(s => s.id === previousStudent.id ? previousStudent : s));
    } else if (type === 'STUDENT_TRASHED') {
      const { studentObj } = undoPayload;
      setTrashedStudents(prev => prev.filter(s => s.id !== studentObj.id));
      setStudents(prev => [studentObj, ...prev]);
    } else if (type === 'ADMISSION') {
      const { studentId } = undoPayload;
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } else if (type === 'CLASS_PROMOTION') {
      const { previousStudentsState } = undoPayload;
      setStudents(previousStudentsState);
    }

    setAuditLogs(prev => prev.map(a => a.id === auditItem.id ? { ...a, undone: true } : a));
    setExportingStatus('Action Reverted Successfully!');
    setTimeout(() => setExportingStatus(''), 2000);
  };

  const handleSoftDeleteStudent = (id) => {
    const target = students.find(s => s.id === id);
    if (!target) return;
    setStudents(prev => prev.filter(s => s.id !== id));
    setTrashedStudents(prev => [target, ...prev]);
    recordAudit(
      'STUDENT_TRASHED',
      `Moved ${target.name} (${target.className}-${target.section}) to Recycle Bin`,
      { studentObj: target }
    );
  };

  const handleRestoreStudent = (id) => {
    const target = trashedStudents.find(s => s.id === id);
    if (!target) return;
    setTrashedStudents(prev => prev.filter(s => s.id !== id));
    setStudents(prev => [target, ...prev]);
    recordAudit('ADMISSION', `Restored ${target.name} from Recycle Bin`);
  };

  const handlePermanentDeleteStudent = (id) => {
    setTrashedStudents(prev => prev.filter(s => s.id !== id));
  };

  // 1-Tap Class Promotion Handler
  const handlePromoteClassBatch = (fromClass, toClass) => {
    const previousStudentsState = JSON.parse(JSON.stringify(students));
    setStudents(prev => prev.map(s => {
      if (s.className === fromClass) {
        return { ...s, className: toClass };
      }
      return s;
    }));
    recordAudit(
      'CLASS_PROMOTION',
      `Promoted all students from Class ${fromClass} to Class ${toClass}`,
      { previousStudentsState }
    );
  };

  if (!schoolInfo.isConfigured || forceWizard) {
    return (
      <SetupWizard
        schoolInfo={schoolInfo}
        setSchoolInfo={setSchoolInfo}
        onComplete={() => {
          setForceWizard(false);
          setIsUnlocked(true);
        }}
      />
    );
  }

  if (!isUnlocked) {
    return (
      <LoginScreen
        schoolInfo={schoolInfo}
        onUnlock={() => setIsUnlocked(true)}
        onReconfigure={() => setForceWizard(true)}
      />
    );
  }

  // Multi-term metric calculator & Class Ranks
  const getStudentMetrics = (s) => {
    const maxPerSub = Number(examConfig.maxMarks) || 100;
    const passPerSub = Number(examConfig.passMarks) || 33;
    const termKey = schoolInfo.examName.replace(/[^a-zA-Z0-9]/g, '_');
    const termMarks = s.termMarks?.[termKey] || s.marks || {};

    const vals = subjects.map(sub => Number(termMarks[sub] ?? 80));
    const total = vals.reduce((a, b) => a + b, 0);
    const maxTotal = subjects.length * maxPerSub;
    const percentage = Number(((total / (maxTotal || 1)) * 100).toFixed(1));
    const passedAllSubjects = vals.every(v => v >= passPerSub);

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 40) grade = 'C';

    // Compute Class Rank
    const sameClassStudents = students.filter(st => st.className === s.className);
    const ranked = sameClassStudents.map(st => {
      const stTermMarks = st.termMarks?.[termKey] || st.marks || {};
      const stVals = subjects.map(sub => Number(stTermMarks[sub] ?? 80));
      const stTot = stVals.reduce((a, b) => a + b, 0);
      return { id: st.id, total: stTot };
    }).sort((a, b) => b.total - a.total);

    const rankIdx = ranked.findIndex(r => r.id === s.id);
    const classRank = rankIdx >= 0 ? rankIdx + 1 : 1;

    return {
      total,
      maxTotal,
      percentage,
      grade: passedAllSubjects ? grade : 'F',
      passed: passedAllSubjects && percentage >= 33,
      classRank
    };
  };

  const getSubjectSchedule = (sub, idx) => {
    return timetable[sub] || {
      code: `ALT-${101 + idx}`,
      date: `2026-11-${String(10 + idx * 2).padStart(2, '0')}`,
      shift: '09:30 AM - 12:30 PM',
      room: 'Hall A - Room 102'
    };
  };

  const formatNiceDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentAadhar && s.studentAadhar.includes(searchQuery));
    const matchesClass = selectedClass === 'All' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const filteredFeeStudents = filteredStudents.filter(s => {
    const due = Number(s.totalFee || 0) - Number(s.paidFee || 0);
    if (feeFilterStatus === 'pending') return due > 0;
    if (feeFilterStatus === 'paid') return due <= 0;
    return true;
  });

  const totalStudents = students.length;
  const totalExpectedFee = students.reduce((acc, s) => acc + Number(s.totalFee || 0), 0);
  const totalCollectedFee = students.reduce((acc, s) => acc + Number(s.paidFee || 0), 0);
  const totalPendingFee = totalExpectedFee - totalCollectedFee;
  const avgPercentage = students.length
    ? (students.reduce((acc, s) => acc + getStudentMetrics(s).percentage, 0) / students.length).toFixed(1)
    : 0;

  const handleRecordPayment = (studentId, amount, remark) => {
    const studentObj = students.find(s => s.id === studentId);
    const feeLogId = 'LOG-' + Date.now();
    const newLog = {
      id: feeLogId,
      studentId,
      amount,
      remark,
      date: new Date().toISOString()
    };
    setFeeLogs([newLog, ...feeLogs]);
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, paidFee: Number(s.paidFee) + amount };
        if (feeManagerStudent?.id === studentId) setFeeManagerStudent(updated);
        return updated;
      }
      return s;
    }));
    recordAudit(
      'FEE_PAID',
      `Collected ₹${amount.toLocaleString()} from ${studentObj?.name || studentId} (${remark})`,
      { studentId, amount, feeLogId }
    );
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
  };

  const handleUpdateFeeAdjustments = (studentId, adj) => {
    const prevStudent = students.find(s => s.id === studentId);
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, ...adj };
        if (feeManagerStudent?.id === studentId) setFeeManagerStudent(updated);
        return updated;
      }
      return s;
    }));
    if (prevStudent) {
      recordAudit(
        'PROFILE_EDIT',
        `Updated fee structure for ${prevStudent.name} (Net: ₹${adj.totalFee.toLocaleString()})`,
        { previousStudent: prevStudent }
      );
    }
  };

  const handleDeleteFeeLog = (logId, studentId, amount) => {
    const studentObj = students.find(s => s.id === studentId);
    const targetLog = feeLogs.find(l => l.id === logId);
    setFeeLogs(feeLogs.filter(l => l.id !== logId));
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, paidFee: Math.max(0, Number(s.paidFee) - amount) };
        if (feeManagerStudent?.id === studentId) setFeeManagerStudent(updated);
        return updated;
      }
      return s;
    }));
    if (targetLog) {
      recordAudit(
        'FEE_REVERT',
        `Reverted ₹${amount.toLocaleString()} fee entry for ${studentObj?.name || studentId}`,
        { restoredLog: targetLog, studentId, amount }
      );
    }
  };

  // Multi-Term Mark Change Handler
  const handleMarkChange = (studentId, subject, value, termKey) => {
    const maxM = Number(examConfig.maxMarks) || 100;
    const clamped = Math.max(0, Math.min(maxM, Number(value) || 0));
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const existingTerms = s.termMarks || {};
        const currentTermMarks = existingTerms[termKey] || { ...(s.marks || {}) };
        currentTermMarks[subject] = clamped;
        return {
          ...s,
          marks: termKey === schoolInfo.examName.replace(/[^a-zA-Z0-9]/g, '_') ? currentTermMarks : s.marks,
          termMarks: {
            ...existingTerms,
            [termKey]: currentTermMarks
          }
        };
      }
      return s;
    }));
  };

  const currentStudioStudent = selectedStudent || students[0];

  const runStudioExport = async (type) => {
    if (!studioRef.current || !currentStudioStudent) return;
    try {
      setExportingStatus(`Generating ${type.toUpperCase()}...`);
      const fileBase = `${currentStudioStudent.name}_${studioMode}`;
      const caption = `Official *${studioMode.toUpperCase()}* for *${currentStudioStudent.name}* (Class ${currentStudioStudent.className}-${currentStudioStudent.section}, Roll #${currentStudioStudent.rollNo}) from *${schoolInfo.name}* (${schoolInfo.session}).`;

      if (type === 'png') {
        await exportElementAsPNG(studioRef.current, fileBase, `${currentStudioStudent.name} - ${studioMode.toUpperCase()}`);
      } else if (type === 'pdf') {
        await exportElementAsPDF(studioRef.current, fileBase, `${currentStudioStudent.name} - ${studioMode.toUpperCase()}`);
      } else if (type === 'whatsapp') {
        await shareElementToWhatsApp(studioRef.current, fileBase, caption, currentStudioStudent.phone);
      }
    } catch (err) {
      alert('Export error: ' + (err?.message || 'Could not generate file'));
    } finally {
      setExportingStatus('');
    }
  };

  const runReceiptExport = async (type) => {
    if (!receiptRef.current || !receiptModalStudent) return;
    try {
      setExportingStatus(`Generating Receipt ${type.toUpperCase()}...`);
      const fileBase = `FeeReceipt_${receiptModalStudent.name}_${receiptModalStudent.rollNo}`;
      const due = Math.max(0, Number(receiptModalStudent.totalFee || 0) - Number(receiptModalStudent.paidFee || 0));
      const caption = `Official Fee Receipt from *${schoolInfo.name}*:\n• Student: *${receiptModalStudent.name}* (${receiptModalStudent.className}-${receiptModalStudent.section})\n• Net Payable Fee: ₹${Number(receiptModalStudent.totalFee).toLocaleString()}\n• Paid Amount: ₹${Number(receiptModalStudent.paidFee).toLocaleString()}\n• *Balance Due: ₹${due.toLocaleString()}*`;

      if (type === 'png') {
        await exportElementAsPNG(receiptRef.current, fileBase, 'Official Fee Receipt');
      } else if (type === 'pdf') {
        await exportElementAsPDF(receiptRef.current, fileBase, 'Official Fee Receipt PDF');
      } else if (type === 'whatsapp') {
        await shareElementToWhatsApp(receiptRef.current, fileBase, caption, receiptModalStudent.phone);
      }
    } catch (err) {
      alert('Receipt export error: ' + (err?.message || 'Could not generate receipt'));
    } finally {
      setExportingStatus('');
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 text-slate-800 pb-28">
      {/* Global Toast */}
      <AnimatePresence>
        {exportingStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 inset-x-4 z-50 max-w-xs mx-auto p-3 rounded-2xl bg-slate-900 text-white text-xs font-extrabold text-center shadow-2xl"
          >
            ✨ {exportingStatus}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Glass Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/75 border-b border-white shadow-sm px-4 py-3 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-orange-400 flex items-center justify-center text-white shadow-md overflow-hidden">
              {schoolInfo.logo ? (
                <img src={schoolInfo.logo} alt="Logo" className="w-full h-full object-cover bg-white" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-violet-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent truncate">
                  Altumtrack
                </h1>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 shrink-0">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {schoolInfo.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('admission')}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-xs shadow-md active:scale-95 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Admission</span>
            </button>

            <button
              onClick={() => setShowAuditModal(true)}
              title="Activity History & Recycle Bin"
              className="relative p-2 rounded-2xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition"
            >
              <History className="w-4 h-4" />
              {trashedStudents.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                  {trashedStudents.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsUnlocked(false)}
              title="Lock App"
              className="p-2 rounded-2xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-3.5 pt-4">
        <AnimatePresence mode="wait">
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-3xl p-5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 text-white shadow-xl">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md mb-2">
                  <Sparkles className="w-3 h-3" /> {schoolInfo.board} • Session {schoolInfo.session}
                </span>
                <h2 className="text-xl sm:text-2xl font-black leading-tight">{schoolInfo.name}</h2>
                <p className="text-white/85 text-xs mt-1">{schoolInfo.address}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={() => setActiveTab('admission')} className="px-3.5 py-2 rounded-xl bg-white text-violet-700 font-extrabold text-xs shadow">
                    + Enroll New Student
                  </button>
                  <button onClick={() => setShowPromotionModal(true)} className="px-3.5 py-2 rounded-xl bg-white/20 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Class Promotion Wizard
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div onClick={() => setActiveTab('students')} className="p-4 rounded-3xl bg-white/85 border border-white shadow-md cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-2">
                    <Users className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Students</p>
                  <p className="text-xl font-black text-slate-800">{totalStudents}</p>
                </div>
                <div onClick={() => setActiveTab('fees')} className="p-4 rounded-3xl bg-white/85 border border-white shadow-md cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Fee Collected</p>
                  <p className="text-xl font-black text-emerald-600">₹{totalCollectedFee.toLocaleString()}</p>
                </div>
                <div onClick={() => { setFeeFilterStatus('pending'); setActiveTab('fees'); }} className="p-4 rounded-3xl bg-white/85 border border-white shadow-md cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Dues</p>
                  <p className="text-xl font-black text-rose-600">₹{totalPendingFee.toLocaleString()}</p>
                </div>
                <div onClick={() => setActiveTab('exams')} className="p-4 rounded-3xl bg-white/85 border border-white shadow-md cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                    <Award className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">School Avg Score</p>
                  <p className="text-xl font-black text-slate-800">{avgPercentage}%</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ADMISSION DESK */}
          {activeTab === 'admission' && (
            <AdmissionDesk
              classes={DEFAULT_CLASSES}
              feeStructure={feeStructure}
              subjects={subjects}
              onSaveStudent={(newStudent) => {
                setStudents([newStudent, ...students]);
                recordAudit(
                  'ADMISSION',
                  `Enrolled ${newStudent.name} in Class ${newStudent.className}-${newStudent.section}`,
                  { studentId: newStudent.id }
                );
                setActiveTab('students');
              }}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {/* 3. STUDENTS DIRECTORY */}
          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-3.5 rounded-3xl bg-white/85 border border-white shadow-md space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student name, roll no, Aadhaar..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {['All', ...DEFAULT_CLASSES].map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedClass(c)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 ${
                        selectedClass === c ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c === 'All' ? 'All' : c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredStudents.map(student => {
                  const due = Math.max(0, student.totalFee - student.paidFee);
                  return (
                    <div key={student.id} className="p-4 rounded-3xl bg-white/90 border border-white shadow-md space-y-3">
                      <div className="flex items-start justify-between">
                        <div onClick={() => setDetailModalStudent(student)} className="flex items-center gap-3 cursor-pointer">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="w-12 h-12 rounded-2xl object-cover border" />
                          ) : (
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${student.avatarColor} text-white font-black text-base flex items-center justify-center`}>
                              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">{student.id}</span>
                            <h3 className="font-extrabold text-sm text-slate-800 mt-0.5">{student.name}</h3>
                            <p className="text-xs font-bold text-violet-600">Class {student.className}-{student.section} • Roll #{student.rollNo}</p>
                          </div>
                        </div>
                        <button onClick={() => setDetailModalStudent(student)} className="px-2.5 py-1.5 rounded-xl bg-violet-50 text-violet-700 font-bold text-[11px] flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> 360° View
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-3 rounded-2xl">
                        <span className="truncate">Father: <b>{student.parentName || 'N/A'}</b></span>
                        <span className="truncate">Mother: <b>{student.motherName || 'N/A'}</b></span>
                        <span>Student UID: <b>{student.studentAadhar || 'N/A'}</b></span>
                        <span>Phone: <b>{student.phone}</b></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${due === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                          {due === 0 ? '✓ Fee Paid' : `₹${due.toLocaleString()} Due`}
                        </span>
                        <button onClick={() => { setSelectedStudent(student); setActiveTab('studio'); }} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
                          Cards & TC →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 4. PRO FEES */}
          {activeTab === 'fees' && (
            <motion.div key="fees" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3.5">
              <div className="p-3.5 rounded-3xl bg-white/90 border border-white shadow-md space-y-2.5">
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
                  {[
                    { id: 'all', label: `All (${filteredStudents.length})` },
                    { id: 'pending', label: `Defaulters (${filteredStudents.filter(s => s.totalFee - s.paidFee > 0).length})` },
                    { id: 'paid', label: `Cleared (${filteredStudents.filter(s => s.totalFee - s.paidFee <= 0).length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setFeeFilterStatus(tab.id)}
                      className={`py-2 rounded-xl text-xs font-extrabold transition ${
                        feeFilterStatus === tab.id ? 'bg-violet-600 text-white shadow' : 'text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredFeeStudents.map(student => {
                const due = Math.max(0, student.totalFee - student.paidFee);
                const percent = Math.min(100, Math.round((student.paidFee / (student.totalFee || 1)) * 100));
                return (
                  <div key={student.id} className="p-4 rounded-3xl bg-white/90 border border-white shadow-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800">{student.name}</h3>
                        <p className="text-xs text-slate-500">
                          Class {student.className}-{student.section} (Roll #{student.rollNo}) • Paid <b>₹{Number(student.paidFee).toLocaleString()}</b> / ₹{Number(student.totalFee).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold ${due === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {due === 0 ? 'PAID' : `₹${due.toLocaleString()} DUE`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button onClick={() => setFeeManagerStudent(student)} className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                        <CreditCard className="w-3.5 h-3.5" /> Pay / Discounts / Logs
                      </button>
                      <button onClick={() => setReceiptModalStudent(student)} className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                        <Printer className="w-3.5 h-3.5" /> Itemized Receipt
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* 5. EXAMS */}
          {activeTab === 'exams' && (
            <ExamManager
              students={students}
              subjects={subjects}
              schoolInfo={schoolInfo}
              setSchoolInfo={setSchoolInfo}
              timetable={timetable}
              setTimetable={setTimetable}
              examConfig={examConfig}
              setExamConfig={setExamConfig}
              onMarkChange={handleMarkChange}
              onOpenReportCard={(st) => {
                setSelectedStudent(st);
                setStudioMode('result');
                setActiveTab('studio');
              }}
              onOpenPromotionModal={() => setShowPromotionModal(true)}
              getStudentMetrics={getStudentMetrics}
            />
          )}

          {/* 6. STUDIO */}
          {activeTab === 'studio' && currentStudioStudent && (
            <motion.div key="studio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-3.5 rounded-3xl bg-white/90 border border-white shadow-md space-y-3 no-print">
                <select
                  value={currentStudioStudent.id}
                  onChange={e => setSelectedStudent(students.find(s => s.id === e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 font-bold text-xs text-slate-800"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className}-{s.section} • Roll #{s.rollNo})</option>
                  ))}
                </select>

                <div className="flex gap-1.5 overflow-x-auto bg-slate-100 p-1.5 rounded-2xl">
                  {[
                    { id: 'admit', label: 'Admit Card' },
                    { id: 'result', label: 'Result Card' },
                    { id: 'idcard', label: 'ID Card (3:4)' },
                    { id: 'tc', label: 'Transfer Cert' },
                    { id: 'bonafide', label: 'Bonafide Cert' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setStudioMode(t.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex-1 ${
                        studioMode === t.id ? 'bg-violet-600 text-white shadow' : 'text-slate-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => runStudioExport('png')} className="py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <Image className="w-3.5 h-3.5" /> Save PNG
                  </button>
                  <button onClick={() => runStudioExport('pdf')} className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <Download className="w-3.5 h-3.5" /> Save PDF
                  </button>
                  <button onClick={() => runStudioExport('whatsapp')} className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </div>

              <div ref={studioRef} className="bg-white rounded-3xl p-2">
                {/* RESULT CARD (NOW WITH CLASS RANK!) */}
                {studioMode === 'result' && (() => {
                  const m = getStudentMetrics(currentStudioStudent);
                  return (
                    <div className="p-4 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xl space-y-4 overflow-hidden">
                      <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {currentStudioStudent.photo && (
                            <img src={currentStudioStudent.photo} alt="Student" className="w-12 h-12 rounded-xl object-cover border-2 border-slate-300" />
                          )}
                          <div>
                            <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                              OFFICIAL REPORT CARD
                            </span>
                            <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1 leading-tight">{schoolInfo.name}</h2>
                            <p className="text-[11px] text-slate-500 font-semibold">{schoolInfo.examName} • {schoolInfo.session}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 block">CLASS RANK</span>
                          <span className="text-2xl font-black text-amber-600">#{m.classRank}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Student Name</p>
                          <p className="font-extrabold text-slate-900">{currentStudioStudent.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Roll & Class</p>
                          <p className="font-bold text-slate-800">#{currentStudioStudent.rollNo} • {currentStudioStudent.className}-{currentStudioStudent.section}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Parent / Guardian</p>
                          <p className="font-bold text-slate-800">{currentStudioStudent.parentName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Grade & Status</p>
                          <p className={`font-black ${m.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {m.grade} ({m.passed ? 'PASSED' : 'RETEST'})
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-900 text-white">
                              <th className="p-2.5">Subject</th>
                              <th className="p-2.5 text-center">Max</th>
                              <th className="p-2.5 text-center">Pass</th>
                              <th className="p-2.5 text-center">Obtained</th>
                              <th className="p-2.5 text-right">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {subjects.map(sub => {
                              const termKey = schoolInfo.examName.replace(/[^a-zA-Z0-9]/g, '_');
                              const termMarks = currentStudioStudent.termMarks?.[termKey] || currentStudioStudent.marks || {};
                              const score = Number(termMarks[sub] ?? 80);
                              return (
                                <tr key={sub}>
                                  <td className="p-2.5 font-bold text-slate-800">{sub}</td>
                                  <td className="p-2.5 text-center text-slate-500">{examConfig.maxMarks}</td>
                                  <td className="p-2.5 text-center text-slate-500">{examConfig.passMarks}</td>
                                  <td className="p-2.5 text-center font-extrabold text-slate-900">{score}</td>
                                  <td className="p-2.5 text-right font-bold text-emerald-600">
                                    {score >= examConfig.maxMarks * 0.9 ? 'Outstanding' : score >= examConfig.maxMarks * 0.75 ? 'Distinction' : score >= examConfig.passMarks ? 'Pass' : 'Needs Work'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-violet-600 uppercase">Grand Total</p>
                          <p className="text-base font-black text-slate-900">{m.total} / {m.maxTotal}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-violet-600 uppercase">Percentage</p>
                          <p className="text-base font-black text-violet-700">{m.percentage}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {studioMode === 'admit' && (
                  <div className="p-4 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xl space-y-4 overflow-hidden">
                    <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {currentStudioStudent.photo && (
                          <img src={currentStudioStudent.photo} alt="Student" className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-300" />
                        )}
                        <div>
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-violet-600 text-white">
                            EXAMINATION ADMIT CARD
                          </span>
                          <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1">{schoolInfo.name}</h2>
                          <p className="text-[11px] text-slate-500 font-semibold">{schoolInfo.examName} • {schoolInfo.session}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div><p className="text-[10px] text-slate-400 font-bold">CANDIDATE</p><p className="font-extrabold">{currentStudioStudent.name}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold">ROLL NO</p><p className="font-extrabold text-violet-700">#{currentStudioStudent.rollNo}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold">CLASS</p><p className="font-bold">{currentStudioStudent.className}-{currentStudioStudent.section}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold">GUARDIAN</p><p className="font-bold">{currentStudioStudent.parentName}</p></div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="p-2.5">Subject</th>
                            <th className="p-2.5">Code</th>
                            <th className="p-2.5">Exam Date</th>
                            <th className="p-2.5">Shift & Room</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {subjects.map((sub, i) => {
                            const sched = getSubjectSchedule(sub, i);
                            return (
                              <tr key={sub}>
                                <td className="p-2.5 font-bold">{sub}</td>
                                <td className="p-2.5 font-mono text-slate-500">{sched.code}</td>
                                <td className="p-2.5 font-extrabold text-violet-700">{formatNiceDate(sched.date)}</td>
                                <td className="p-2.5 text-slate-600">{sched.shift} ({sched.room})</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {studioMode === 'idcard' && (
                  <div className="max-w-[280px] mx-auto rounded-3xl overflow-hidden bg-white border-2 border-slate-300 shadow-2xl aspect-[3/4] flex flex-col justify-between">
                    <div className="p-4 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 text-white text-center">
                      <h3 className="font-black text-xs uppercase tracking-wide">{schoolInfo.name}</h3>
                      <p className="text-[9px] text-white/80 font-semibold">STUDENT ID • {schoolInfo.session}</p>
                      {currentStudioStudent.photo ? (
                        <img src={currentStudioStudent.photo} alt="ID" className="w-24 h-24 mx-auto mt-2 rounded-2xl object-cover border-2 border-white shadow-md" />
                      ) : (
                        <div className="w-24 h-24 mx-auto mt-2 rounded-2xl bg-white/20 border-2 border-white text-white font-black text-2xl flex items-center justify-center">
                          {currentStudioStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <h4 className="font-extrabold text-base mt-1.5 leading-tight">{currentStudioStudent.name}</h4>
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-white text-violet-700 mt-0.5">
                        Class {currentStudioStudent.className}-{currentStudioStudent.section} • Roll #{currentStudioStudent.rollNo}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-1.5 text-[11px] bg-white text-slate-700">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400 font-bold">Student UID:</span>
                        <b className="font-mono">{currentStudioStudent.studentAadhar || 'N/A'}</b>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400 font-bold">Father / Guardian:</span>
                        <b className="truncate max-w-[140px]">{currentStudioStudent.parentName || 'N/A'}</b>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400 font-bold">Emergency Call:</span>
                        <b className="text-emerald-600">{currentStudioStudent.phone}</b>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400 font-bold">Blood Group:</span>
                        <b className="text-rose-600">{currentStudioStudent.bloodGroup}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Address:</span>
                        <b className="truncate max-w-[140px]">{currentStudioStudent.address || 'N/A'}</b>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white text-[9px] font-bold text-center py-1">
                      Authorized Principal Signature
                    </div>
                  </div>
                )}

                {studioMode === 'tc' && (
                  <div className="p-5 sm:p-8 rounded-3xl bg-white border-2 border-slate-300 shadow-xl space-y-5 text-xs">
                    <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                      <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-600 text-white">
                        OFFICIAL SCHOOL LEAVING / TRANSFER CERTIFICATE
                      </span>
                      <h2 className="text-lg sm:text-2xl font-black text-slate-900">{schoolInfo.name}</h2>
                      <p className="text-slate-500 font-semibold">{schoolInfo.address}</p>
                    </div>

                    <div className="flex justify-between font-bold text-slate-700">
                      <span>TC No: TC/{schoolInfo.session}/{currentStudioStudent.rollNo}</span>
                      <span>Admission ID: {currentStudioStudent.id}</span>
                    </div>

                    <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">1. Pupil Name:</span><b className="uppercase">{currentStudioStudent.name}</b></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">2. Father's Name:</span><b>{currentStudioStudent.parentName}</b></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">3. Mother's Name:</span><b>{currentStudioStudent.motherName}</b></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">4. Aadhaar UID:</span><b className="font-mono">{currentStudioStudent.studentAadhar || 'Verified'}</b></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">5. Date of Birth:</span><b>{currentStudioStudent.dob}</b></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">6. Class Studied:</span><b className="text-violet-700">Class {currentStudioStudent.className} - Sec {currentStudioStudent.section}</b></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">7. Promotion Status:</span><b className="text-emerald-700">YES, QUALIFIED</b></div>
                      <div className="flex justify-between"><span>8. Fee Dues Cleared:</span><b>YES, NO DUES</b></div>
                    </div>

                    <div className="pt-8 flex items-center justify-between text-xs text-slate-600 border-t border-dashed">
                      <span>Class Teacher</span>
                      <span className="font-black text-slate-900">{schoolInfo.principal} (Principal Seal)</span>
                    </div>
                  </div>
                )}

                {studioMode === 'bonafide' && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-300 shadow-xl space-y-6 text-xs">
                    <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                      <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-violet-600 text-white">
                        BONAFIDE & CHARACTER CERTIFICATE
                      </span>
                      <h2 className="text-lg sm:text-2xl font-black text-slate-900">{schoolInfo.name}</h2>
                      <p className="text-slate-500 font-semibold">{schoolInfo.address}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm leading-7 text-slate-800">
                      This is to certify that Master / Miss <b className="text-violet-700 uppercase">{currentStudioStudent.name}</b>,
                      Roll No. <b>#{currentStudioStudent.rollNo}</b> (Admission ID: <b>{currentStudioStudent.id}</b>), son/daughter of
                      Sri <b>{currentStudioStudent.parentName}</b> and Smt. <b>{currentStudioStudent.motherName}</b>,
                      is a bonafide student of <b>{schoolInfo.name}</b> studying in <b>Class {currentStudioStudent.className} ({currentStudioStudent.section})</b> during
                      session <b>{schoolInfo.session}</b>.
                      <br /><br />
                      His/her Date of Birth is <b>{currentStudioStudent.dob}</b> and he/she bears a <b>Good Moral Character</b>.
                    </div>

                    <div className="pt-10 flex items-center justify-between text-xs text-slate-600">
                      <span>Office Stamp</span>
                      <span className="font-black text-slate-900">{schoolInfo.principal} (Principal)</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 7. SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView
              schoolInfo={schoolInfo}
              setSchoolInfo={setSchoolInfo}
              feeStructure={feeStructure}
              setFeeStructure={setFeeStructure}
              subjects={subjects}
              setSubjects={setSubjects}
              classes={DEFAULT_CLASSES}
              students={students}
              setStudents={setStudents}
              timetable={timetable}
              setTimetable={setTimetable}
              onLaunchWizard={() => setForceWizard(true)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Global Audit History & Recycle Bin Modal */}
      <AnimatePresence>
        {showAuditModal && (
          <AuditCenterModal
            auditLogs={auditLogs}
            trashedStudents={trashedStudents}
            onClose={() => setShowAuditModal(false)}
            onUndoAction={handleUndoAction}
            onRestoreStudent={handleRestoreStudent}
            onPermanentDeleteStudent={handlePermanentDeleteStudent}
            onClearLogs={() => setAuditLogs([])}
          />
        )}
      </AnimatePresence>

      {/* Class Promotion Modal */}
      <AnimatePresence>
        {showPromotionModal && (
          <ClassPromotionModal
            students={students}
            onClose={() => setShowPromotionModal(false)}
            onPromoteClass={handlePromoteClassBatch}
          />
        )}
      </AnimatePresence>

      {/* 360° Student Detail & Edit Modal */}
      <AnimatePresence>
        {detailModalStudent && (
          <StudentDetailModal
            student={detailModalStudent}
            classes={DEFAULT_CLASSES}
            schoolInfo={schoolInfo}
            metrics={getStudentMetrics(detailModalStudent)}
            onClose={() => setDetailModalStudent(null)}
            onUpdateStudent={(updated) => {
              const previousStudent = students.find(s => s.id === updated.id);
              setStudents(students.map(s => s.id === updated.id ? updated : s));
              setDetailModalStudent(updated);
              if (previousStudent) {
                recordAudit(
                  'PROFILE_EDIT',
                  `Edited profile details of ${updated.name}`,
                  { previousStudent }
                );
              }
            }}
            onDeleteStudent={handleSoftDeleteStudent}
            onOpenStudio={(st, mode) => {
              setSelectedStudent(st);
              setStudioMode(mode);
              setDetailModalStudent(null);
              setActiveTab('studio');
            }}
          />
        )}
      </AnimatePresence>

      {/* Pro Fee Manager Modal */}
      <AnimatePresence>
        {feeManagerStudent && (
          <FeeManagerModal
            student={feeManagerStudent}
            schoolInfo={schoolInfo}
            classFeeBreakdown={feeStructure[feeManagerStudent.className]}
            feeLogs={feeLogs}
            onClose={() => setFeeManagerStudent(null)}
            onRecordPayment={handleRecordPayment}
            onDeleteLog={handleDeleteFeeLog}
            onUpdateFeeAdjustments={handleUpdateFeeAdjustments}
            onOpenReceipt={(st) => {
              setFeeManagerStudent(null);
              setReceiptModalStudent(st);
            }}
          />
        )}
      </AnimatePresence>

      {/* Itemized Official Fee Receipt Modal */}
      <AnimatePresence>
        {receiptModalStudent && (() => {
          const cf = feeStructure[receiptModalStudent.className] || {
            admissionFee: 8000, tuitionFee: 32000, examFee: 3000, annualCharges: 5000
          };
          const recentStudentLogs = feeLogs.filter(l => l.studentId === receiptModalStudent.id).slice(0, 3);
          const due = Math.max(0, Number(receiptModalStudent.totalFee) - Number(receiptModalStudent.paidFee));

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-3.5">
              <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500">Itemized Fee Receipt Preview</span>
                  <button onClick={() => setReceiptModalStudent(null)} className="p-1.5 rounded-xl bg-slate-100"><X className="w-4 h-4" /></button>
                </div>

                <div ref={receiptRef} className="p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-3.5 text-xs">
                  <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                        OFFICIAL FEE RECEIPT
                      </span>
                      <h3 className="font-black text-base text-slate-900 mt-1">{schoolInfo.name}</h3>
                      <p className="text-[10px] text-slate-500">{schoolInfo.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400">RECEIPT NO</p>
                      <p className="font-mono font-black text-slate-800">REC-{receiptModalStudent.rollNo}-{new Date().getFullYear()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                    <div><span className="text-slate-400">Student:</span> <b>{receiptModalStudent.name}</b></div>
                    <div><span className="text-slate-400">Class:</span> <b>{receiptModalStudent.className}-{receiptModalStudent.section} (#{receiptModalStudent.rollNo})</b></div>
                    <div><span className="text-slate-400">Guardian:</span> <b>{receiptModalStudent.parentName || 'N/A'}</b></div>
                    <div><span className="text-slate-400">Session:</span> <b>{schoolInfo.session}</b></div>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="p-2 text-left">Fee Particular</th>
                          <th className="p-2 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr><td className="p-2">Admission & Registration Fee</td><td className="p-2 text-right font-bold">{cf.admissionFee.toLocaleString()}</td></tr>
                        <tr><td className="p-2">Annual Tuition Fee</td><td className="p-2 text-right font-bold">{cf.tuitionFee.toLocaleString()}</td></tr>
                        <tr><td className="p-2">Examination & Lab Fee</td><td className="p-2 text-right font-bold">{cf.examFee.toLocaleString()}</td></tr>
                        <tr><td className="p-2">Annual Development Charges</td><td className="p-2 text-right font-bold">{cf.annualCharges.toLocaleString()}</td></tr>
                        {Number(receiptModalStudent.transportFee) > 0 && (
                          <tr><td className="p-2">Transport / Bus Fee</td><td className="p-2 text-right font-bold">+{Number(receiptModalStudent.transportFee).toLocaleString()}</td></tr>
                        )}
                        {Number(receiptModalStudent.lateFine) > 0 && (
                          <tr><td className="p-2 text-rose-600">Late Fine / Misc</td><td className="p-2 text-right font-bold text-rose-600">+{Number(receiptModalStudent.lateFine).toLocaleString()}</td></tr>
                        )}
                        {Number(receiptModalStudent.discount) > 0 && (
                          <tr><td className="p-2 text-emerald-700">Scholarship / Concession</td><td className="p-2 text-right font-bold text-emerald-700">-{Number(receiptModalStudent.discount).toLocaleString()}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {recentStudentLogs.length > 0 && (
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 space-y-1 text-[10px]">
                      <p className="font-extrabold text-emerald-800 uppercase">Recent Installments Received:</p>
                      {recentStudentLogs.map(l => (
                        <div key={l.id} className="flex justify-between text-emerald-900">
                          <span>{new Date(l.date).toLocaleDateString('en-IN')} ({l.remark})</span>
                          <b>₹{l.amount.toLocaleString()}</b>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 pt-1 border-t">
                    <div className="flex justify-between text-slate-600"><span>Net Payable Fee:</span><b>₹{Number(receiptModalStudent.totalFee).toLocaleString()}</b></div>
                    <div className="flex justify-between text-emerald-700 text-sm"><span>Total Paid to Date:</span><b className="font-black">₹{Number(receiptModalStudent.paidFee).toLocaleString()}</b></div>
                    <div className="flex justify-between text-rose-600 border-t pt-1"><span>Balance Due:</span><b className="font-black">₹{due.toLocaleString()}</b></div>
                  </div>

                  <div className="pt-3 border-t border-dashed flex justify-between text-[10px] text-slate-500">
                    <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
                    <span className="font-bold text-slate-800">Authorized Cashier / Seal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => runReceiptExport('png')} className="py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <Image className="w-3.5 h-3.5" /> Save PNG
                  </button>
                  <button onClick={() => runReceiptExport('pdf')} className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <Download className="w-3.5 h-3.5" /> Save PDF
                  </button>
                  <button onClick={() => runReceiptExport('whatsapp')} className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Bottom Floating Navigation Bar */}
      <nav className="fixed bottom-3 inset-x-3 z-40 max-w-md mx-auto rounded-3xl backdrop-blur-2xl bg-white/85 border border-white shadow-2xl p-1.5 flex items-center justify-around no-print">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'admission', label: 'Admission', icon: UserPlus },
          { id: 'fees', label: 'Fees', icon: CreditCard },
          { id: 'exams', label: 'Exams', icon: FileSpreadsheet },
          { id: 'studio', label: 'Cards', icon: Award },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-xs font-bold transition-all ${
                active ? 'text-white' : 'text-slate-500'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="navPill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-orange-500 shadow-md -z-10"
                />
              )}
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[8px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
