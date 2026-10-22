import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Printer, Layers, Award, AlertCircle, Image, Download,
  MessageCircle, Users, CheckCircle2, Calendar, FileText, Search, Sparkles
} from 'lucide-react';
import {
  exportElementAsPNG,
  exportElementAsPDF,
  exportBatchElementsAsPDF,
  sendWhatsAppWithImage
} from '../utils/exportHelper';
import GlassSelect from './GlassSelect';
import VerificationQRCode from './VerificationQRCode';

export default function BulkPrintStudioModal({
  classes,
  students,
  subjects,
  schoolInfo,
  timetable,
  examConfig,
  getStudentMetrics,
  onClose
}) {
  const [selectedClass, setSelectedClass] = useState('10th');
  const [docType, setDocType] = useState('merit'); // merit | defaulter | admit_batch
  const [searchStudent, setSearchStudent] = useState('');
  
  // Progress modal state for batch exports
  const [exportProgress, setExportProgress] = useState(null); // { current, total, label }

  const bulkRef = useRef(null);
  const cardRefs = useRef([]);

  const classStudents = students.filter(s => {
    const matchClass = s.className === selectedClass;
    const matchSearch = !searchStudent ||
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.rollNo.includes(searchStudent);
    return matchClass && matchSearch;
  });

  const rankedClassStudents = [...classStudents].sort((a, b) => {
    return getStudentMetrics(b).percentage - getStudentMetrics(a).percentage;
  });

  const defaulterStudents = classStudents.filter(s => {
    return (Number(s.totalFee || 0) - Number(s.paidFee || 0)) > 0;
  });

  const totalClassDue = defaulterStudents.reduce((acc, s) => {
    return acc + Math.max(0, Number(s.totalFee || 0) - Number(s.paidFee || 0));
  }, 0);

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

  const getSchoolDisplayName = () => {
    return (schoolInfo?.name || 'Altum International Academy').replace(/altumisbest/gi, '').trim() || 'Altum International Academy';
  };

  // High-performance batch export handler
  const handleExport = async (type) => {
    try {
      const fileBase = `Class_${selectedClass}_${docType.toUpperCase()}_Altumtrack`;
      const caption = `Official *${docType.toUpperCase().replace('_', ' ')}* for *Class ${selectedClass}* from *${getSchoolDisplayName()}* (${schoolInfo.session}).`;

      if (docType === 'admit_batch') {
        // Collect individual card nodes
        const activeCards = cardRefs.current.filter(Boolean);
        if (activeCards.length === 0) {
          alert('No students to export.');
          return;
        }

        if (type === 'pdf') {
          setExportProgress({ current: 1, total: activeCards.length, label: 'Building Multi-Page PDF' });
          await exportBatchElementsAsPDF(activeCards, fileBase, (current, total) => {
            setExportProgress({ current, total, label: 'Rendering Student Admit Cards' });
          });
          setExportProgress(null);
          return;
        }
      }

      // Standard export for Merit Gazette / Defaulter Sheet
      if (type === 'png') {
        setExportProgress({ current: 1, total: 1, label: 'Rendering High-Resolution Image' });
        await exportElementAsPNG(bulkRef.current, fileBase, `Class ${selectedClass} ${docType}`);
      } else if (type === 'pdf') {
        setExportProgress({ current: 1, total: 1, label: 'Formatting Multi-Page A4 PDF' });
        await exportElementAsPDF(bulkRef.current, fileBase, `Class ${selectedClass} ${docType} PDF`);
      } else if (type === 'whatsapp') {
        await sendWhatsAppWithImage(bulkRef.current, fileBase, caption, '', 'native_share');
      }
    } catch (err) {
      alert('Export failed: ' + (err?.message || 'Error generating document'));
    } finally {
      setExportProgress(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-3"
    >
      <motion.div
        initial={{ scale: 0.94, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 15 }}
        className="bg-white rounded-[32px] max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-white max-h-[94vh] overflow-y-auto space-y-4 text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-orange-500 text-white flex items-center justify-center shadow">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Bulk Print & Gazette Studio</h3>
              <p className="text-[11px] text-slate-500">Multi-page A4 PDFs, Gazettes & Batch Admit Cards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Progress Overlay */}
        <AnimatePresence>
          {exportProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-xl"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <div>
                  <p className="font-black text-xs">{exportProgress.label}</p>
                  <p className="text-[10px] text-slate-400">Processing page {exportProgress.current} of {exportProgress.total}...</p>
                </div>
              </div>
              <div className="text-right font-mono font-black text-xs text-amber-400">
                {Math.round((exportProgress.current / exportProgress.total) * 100)}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Bar: Class Selection + Document Type + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50 p-3 rounded-2xl border">
          <div className="w-full sm:w-56">
            <GlassSelect
              value={selectedClass}
              onChange={setSelectedClass}
              options={classes.map(c => ({
                value: c,
                label: `Class ${c} (${students.filter(s => s.className === c).length} Students)`
              }))}
              title="Target Class"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl">
            {[
              { id: 'merit', label: 'Merit Gazette', icon: Award },
              { id: 'defaulter', label: 'Defaulter Sheet', icon: AlertCircle },
              { id: 'admit_batch', label: 'Batch Admit', icon: Printer }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setDocType(t.id)}
                  className={`py-1.5 px-2.5 rounded-lg font-black flex items-center justify-center gap-1 transition ${
                    docType === t.id ? 'bg-violet-600 text-white shadow' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => window.print()}
            className="py-2.5 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" /> Print System PDF
          </button>
          <button
            onClick={() => handleExport('png')}
            className="py-2.5 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
          >
            <Image className="w-3.5 h-3.5" /> Save Clean PNG
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="py-2.5 rounded-xl bg-fuchsia-600 text-white font-black flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" /> Multi-Page PDF
          </button>
          <button
            onClick={() => handleExport('whatsapp')}
            className="py-2.5 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Sheet
          </button>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="bg-slate-100 p-2 sm:p-4 rounded-3xl overflow-x-auto">
          {/* 1. MERIT LIST / RESULT GAZETTE */}
          {docType === 'merit' && (
            <div ref={bulkRef} className="p-6 sm:p-8 rounded-[32px] bg-white border-2 border-slate-300 shadow-xl space-y-4 max-w-3xl mx-auto">
              <div className="border-b-2 border-slate-900 pb-3.5 flex justify-between items-start gap-3">
                <div>
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-violet-600 text-white">
                    OFFICIAL RESULT GAZETTE & MERIT RANK LIST
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1.5">{getSchoolDisplayName()}</h2>
                  <p className="text-[11px] text-slate-500 font-bold">
                    {schoolInfo.examName} • Academic Session {schoolInfo.session}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-xl bg-violet-100 text-violet-800 font-black text-xs">
                    Class {selectedClass}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">{classStudents.length} Candidates</p>
                </div>
              </div>

              {rankedClassStudents.length === 0 ? (
                <p className="text-center text-slate-400 py-8 font-bold">No students found enrolled in Class {selectedClass}.</p>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-2.5 text-center">Rank</th>
                        <th className="p-2.5 text-center">Roll</th>
                        <th className="p-2.5">Candidate Name</th>
                        {subjects.map(s => (
                          <th key={s} className="p-2.5 text-center">{s.slice(0, 4)}</th>
                        ))}
                        <th className="p-2.5 text-center">Total</th>
                        <th className="p-2.5 text-center">%</th>
                        <th className="p-2.5 text-center">Grade</th>
                        <th className="p-2.5 text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rankedClassStudents.map((st, idx) => {
                        const m = getStudentMetrics(st);
                        const termKey = (schoolInfo.examName || '').replace(/[^a-zA-Z0-9]/g, '_');
                        const termMarks = st.termMarks?.[termKey] || st.marks || {};
                        return (
                          <tr key={st.id} className={idx < 3 ? 'bg-amber-50/60 font-semibold' : 'bg-white'}>
                            <td className="p-2.5 text-center font-black">
                              {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                            </td>
                            <td className="p-2.5 text-center font-bold text-slate-500">#{st.rollNo}</td>
                            <td className="p-2.5 font-black text-slate-900">{st.name}</td>
                            {subjects.map(sub => (
                              <td key={sub} className="p-2.5 text-center text-slate-700">
                                {termMarks[sub] ?? 80}
                              </td>
                            ))}
                            <td className="p-2.5 text-center font-black text-slate-900">{m.total}/{m.maxTotal}</td>
                            <td className="p-2.5 text-center font-black text-violet-700">{m.percentage}%</td>
                            <td className="p-2.5 text-center font-black text-slate-800">{m.grade}</td>
                            <td className="p-2.5 text-center font-black">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                                m.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {m.passed ? 'PASSED' : 'RETEST'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-6 border-t border-dashed flex items-center justify-between text-[11px] text-slate-600">
                <span>Class Teacher Signature</span>
                <span>Examination Controller</span>
                <span className="font-bold text-slate-900">{schoolInfo.principal || 'Principal'} (Seal)</span>
              </div>
            </div>
          )}

          {/* 2. CLASS FEE DEFAULTERS */}
          {docType === 'defaulter' && (
            <div ref={bulkRef} className="p-6 sm:p-8 rounded-[32px] bg-white border-2 border-slate-300 shadow-xl space-y-4 max-w-3xl mx-auto">
              <div className="border-b-2 border-slate-900 pb-3.5 flex justify-between items-start gap-3">
                <div>
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-rose-600 text-white">
                    FEE COLLECTION & DEFAULTER STATEMENT
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1.5">{getSchoolDisplayName()}</h2>
                  <p className="text-[11px] text-slate-500 font-bold">Class {selectedClass} • Session {schoolInfo.session}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-black text-xs">
                    Pending Due: ₹{totalClassDue.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">{defaulterStudents.length} Defaulters in Class</p>
                </div>
              </div>

              {defaulterStudents.length === 0 ? (
                <div className="p-8 text-center text-emerald-600 font-extrabold text-sm">
                  ✓ Outstanding! 100% of fees in Class {selectedClass} are cleared with zero pending dues!
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-2.5 text-center">Roll</th>
                        <th className="p-2.5">Candidate Name</th>
                        <th className="p-2.5">Guardian Name</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5 text-right">Total Fee</th>
                        <th className="p-2.5 text-right">Paid Amount</th>
                        <th className="p-2.5 text-right">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {defaulterStudents.map(st => {
                        const due = Math.max(0, Number(st.totalFee || 0) - Number(st.paidFee || 0));
                        return (
                          <tr key={st.id} className="bg-white">
                            <td className="p-2.5 text-center font-bold text-slate-500">#{st.rollNo}</td>
                            <td className="p-2.5 font-black text-slate-900">{st.name}</td>
                            <td className="p-2.5 font-bold text-slate-700">{st.parentName || 'N/A'}</td>
                            <td className="p-2.5 font-mono text-emerald-700">{st.phone}</td>
                            <td className="p-2.5 text-right font-bold text-slate-600">₹{Number(st.totalFee).toLocaleString()}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-700">₹{Number(st.paidFee).toLocaleString()}</td>
                            <td className="p-2.5 text-right font-black text-rose-600 text-xs">₹{due.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-6 border-t border-dashed flex items-center justify-between text-[11px] text-slate-600">
                <span>Accounts Officer</span>
                <span>Class Teacher</span>
                <span className="font-bold text-slate-900">{schoolInfo.principal || 'Principal'} (Seal)</span>
              </div>
            </div>
          )}

          {/* 3. BATCH ADMIT CARDS (ONE CLEAN A4 CARD PER STUDENT) */}
          {docType === 'admit_batch' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {classStudents.length === 0 ? (
                <p className="text-center text-slate-400 py-8 font-bold">No students found in Class {selectedClass}.</p>
              ) : (
                classStudents.map((st, idx) => {
                  const qrPayload = `ALTUMTRACK ADMIT CARD VERIFIED\nCandidate: ${st.name}\nRoll: #${st.rollNo} (Class ${st.className})\nExam: ${schoolInfo.examName}\nSchool: ${getSchoolDisplayName()}`;

                  return (
                    <div
                      key={st.id}
                      ref={el => cardRefs.current[idx] = el}
                      className="p-6 sm:p-8 rounded-[32px] bg-white border-2 border-slate-300 shadow-xl space-y-4"
                    >
                      <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {st.photo && (
                            <img src={st.photo} alt="Student" className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-300 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                              EXAMINATION ADMIT CARD
                            </span>
                            <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1 truncate">{getSchoolDisplayName()}</h2>
                            <p className="text-[11px] text-slate-500 font-semibold truncate">{schoolInfo.examName} • {schoolInfo.session}</p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <VerificationQRCode value={qrPayload} size={54} label="SECURITY" subtitle="ADMIT-CARD" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border">
                        <div><p className="text-[10px] text-slate-400 font-bold uppercase">CANDIDATE</p><p className="font-extrabold text-slate-900 truncate">{st.name}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-bold uppercase">ROLL NO</p><p className="font-extrabold text-blue-700">#{st.rollNo}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-bold uppercase">CLASS</p><p className="font-bold">{st.className}-{st.section}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-bold uppercase">GUARDIAN</p><p className="font-bold truncate">{st.parentName}</p></div>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="bg-slate-900 text-white">
                              <th className="p-2">Subject</th>
                              <th className="p-2">Code</th>
                              <th className="p-2">Exam Date</th>
                              <th className="p-2">Shift & Hall</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {subjects.map((sub, sIdx) => {
                              const sched = getSubjectSchedule(sub, sIdx);
                              return (
                                <tr key={sub}>
                                  <td className="p-2 font-bold">{sub}</td>
                                  <td className="p-2 font-mono text-slate-500">{sched.code}</td>
                                  <td className="p-2 font-extrabold text-blue-700">{formatNiceDate(sched.date)}</td>
                                  <td className="p-2 text-slate-600">{sched.shift} ({sched.room})</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="pt-4 border-t border-dashed flex items-center justify-between text-[10px] text-slate-500">
                        <span>Candidate Signature</span>
                        <span className="font-bold text-slate-900">{schoolInfo.principal || 'Principal'} (Controller of Exams)</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
