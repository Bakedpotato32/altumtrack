import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, BookOpen, Sliders, Award, Plus, Trash2, Check, Sparkles,
  Layers, RefreshCw, CheckCircle2, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CurriculumManagerModal({
  classes,
  classSubjects,
  setClassSubjects,
  examTerms,
  setExamTerms,
  activeExamName,
  setActiveExamName,
  subjectMarksConfig,
  setSubjectMarksConfig,
  onClose
}) {
  const [tab, setTab] = useState('matrix'); // matrix | subjects | exams
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedExam, setSelectedExam] = useState(activeExamName || examTerms[0]);
  
  // New subject input
  const [newSubjectName, setNewSubjectName] = useState('');
  
  // New exam term input
  const [newExamTerm, setNewExamTerm] = useState('');

  const currentClassSubjects = classSubjects[selectedClass] || [];

  // Helper to get max and pass marks for a specific exam + class + subject
  const getMarksForSubject = (subject) => {
    const config = subjectMarksConfig?.[selectedExam]?.[selectedClass]?.[subject];
    return {
      maxMarks: config?.maxMarks ?? 100,
      passMarks: config?.passMarks ?? 33
    };
  };

  // Update specific subject marks
  const handleUpdateMarks = (subject, field, value) => {
    const num = Math.max(1, Number(value) || 0);
    const existing = getMarksForSubject(subject);
    const updatedForSubject = {
      ...existing,
      [field]: num
    };

    setSubjectMarksConfig(prev => ({
      ...prev,
      [selectedExam]: {
        ...(prev[selectedExam] || {}),
        [selectedClass]: {
          ...(prev[selectedExam]?.[selectedClass] || {}),
          [subject]: updatedForSubject
        }
      }
    }));
  };

  // Quick 1-Tap Preset Applicator (e.g. Set all to 40M / 13M)
  const applyQuickMarksPreset = (max, pass) => {
    const classConfig = {};
    currentClassSubjects.forEach(sub => {
      classConfig[sub] = { maxMarks: max, passMarks: pass };
    });

    setSubjectMarksConfig(prev => ({
      ...prev,
      [selectedExam]: {
        ...(prev[selectedExam] || {}),
        [selectedClass]: classConfig
      }
    }));
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  // Add Subject to Selected Class
  const handleAddSubjectToClass = (e) => {
    e.preventDefault();
    const name = newSubjectName.trim();
    if (!name || currentClassSubjects.includes(name)) return;
    
    const updated = [...currentClassSubjects, name];
    setClassSubjects(prev => ({
      ...prev,
      [selectedClass]: updated
    }));
    setNewSubjectName('');
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
  };

  // Remove Subject from Selected Class
  const handleRemoveSubjectFromClass = (subName) => {
    if (currentClassSubjects.length <= 1) return;
    const updated = currentClassSubjects.filter(s => s !== subName);
    setClassSubjects(prev => ({
      ...prev,
      [selectedClass]: updated
    }));
  };

  // Add New Custom Exam Term
  const handleAddExamTerm = (e) => {
    e.preventDefault();
    const name = newExamTerm.trim().toUpperCase();
    if (!name || examTerms.includes(name)) return;
    
    setExamTerms([...examTerms, name]);
    setSelectedExam(name);
    setNewExamTerm('');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  // Delete Exam Term
  const handleDeleteExamTerm = (termToDelete) => {
    if (examTerms.length <= 1) return;
    const updated = examTerms.filter(t => t !== termToDelete);
    setExamTerms(updated);
    if (selectedExam === termToDelete) {
      setSelectedExam(updated[0]);
    }
    if (activeExamName === termToDelete) {
      setActiveExamName(updated[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.94, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 15 }}
        className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl border border-white max-h-[92vh] flex flex-col overflow-hidden text-xs"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Curriculum & Exam Architect</h3>
              <p className="text-[11px] text-slate-500 font-medium">Custom Subjects, Exam Terms & Subject-Wise Max Marks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200/60 grid grid-cols-3 gap-1.5">
          {[
            { id: 'matrix', label: 'Max Marks Matrix', icon: Award },
            { id: 'subjects', label: 'Class Subjects', icon: BookOpen },
            { id: 'exams', label: 'Exam Terms', icon: Layers }
          ].map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* ================= 1. TOTAL & PASS MARKS MATRIX ================= */}
          {tab === 'matrix' && (
            <div className="space-y-4">
              {/* Context Selector Bar: Exam Term & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Select Exam Term:
                  </label>
                  <select
                    value={selectedExam}
                    onChange={e => setSelectedExam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-black text-slate-900 text-xs"
                  >
                    {examTerms.map(term => <option key={term} value={term}>{term}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Select Class:
                  </label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-black text-slate-900 text-xs"
                  >
                    {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
              </div>

              {/* 1-Tap Quick Presets for this Class */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Apply Quick Preset to All:</span>
                <div className="flex gap-1.5 overflow-x-auto">
                  {[
                    { label: '100M / 33 Pass', max: 100, pass: 33 },
                    { label: '80M / 27 Pass', max: 80, pass: 27 },
                    { label: '50M / 17 Pass', max: 50, pass: 17 },
                    { label: '40M / 13 Pass', max: 40, pass: 13 },
                    { label: '25M / 8 Pass', max: 25, pass: 8 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyQuickMarksPreset(p.max, p.pass)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] border border-blue-200/80 whitespace-nowrap"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject-Wise Total Marks Configuration Grid */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[11px] font-black text-slate-700 px-1">
                  <span>Subjects for Class {selectedClass} ({currentClassSubjects.length})</span>
                  <span>Target Max & Pass Marks</span>
                </div>

                {currentClassSubjects.map(sub => {
                  const marks = getMarksForSubject(sub);
                  return (
                    <div
                      key={sub}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{sub}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">Class {selectedClass} • {selectedExam}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-24">
                          <label className="text-[9px] font-black uppercase text-blue-600 block">Max Marks</label>
                          <input
                            type="number"
                            min="1"
                            value={marks.maxMarks}
                            onChange={e => handleUpdateMarks(sub, 'maxMarks', e.target.value)}
                            className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-slate-900 text-center"
                          />
                        </div>
                        <div className="w-24">
                          <label className="text-[9px] font-black uppercase text-emerald-600 block">Pass Marks</label>
                          <input
                            type="number"
                            min="1"
                            value={marks.passMarks}
                            onChange={e => handleUpdateMarks(sub, 'passMarks', e.target.value)}
                            className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-slate-900 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 2. CUSTOM SUBJECTS PER CLASS ================= */}
          {tab === 'subjects' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 block">
                  Select Class to Edit Curriculum:
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {classes.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedClass(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition ${
                        selectedClass === c
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Subject Input */}
              <form onSubmit={handleAddSubjectToClass} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add custom subject for Class ${selectedClass} (e.g. Sanskrit, Coding, Biology)...`}
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-blue-600 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              {/* Current Subjects Grid for this class */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400">Current Subjects for Class {selectedClass}:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentClassSubjects.map(sub => (
                    <div
                      key={sub}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-black text-slate-800 text-xs">{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectFromClass(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. CUSTOM EXAM TERMS ================= */}
          {tab === 'exams' && (
            <div className="space-y-4">
              <form onSubmit={handleAddExamTerm} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Create new exam term (e.g. PERIODIC TEST 1, PRE-BOARD 2026)..."
                  value={newExamTerm}
                  onChange={e => setNewExamTerm(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition"
                >
                  <Plus className="w-4 h-4" /> Add Exam
                </button>
              </form>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400">Configured Examination Terms ({examTerms.length}):</p>
                <div className="space-y-2">
                  {examTerms.map(term => {
                    const isActive = activeExamName === term;
                    return (
                      <div
                        key={term}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                          isActive
                            ? 'bg-blue-50/80 border-blue-400 shadow-sm'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isActive && (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                          )}
                          <div>
                            <h4 className="font-black text-slate-900 text-xs">{term}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              {isActive ? '✓ Currently Active Term for Report Cards' : 'Click "Set Active" to use for reports'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveExamName(term);
                                confetti({ particleCount: 30, spread: 40 });
                              }}
                              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[10px] hover:bg-blue-50 hover:text-blue-700 transition"
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteExamTerm(term)}
                            disabled={examTerms.length <= 1}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg disabled:opacity-30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Done Button */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs shadow-md active:scale-95 transition"
          >
            Done & Apply Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
