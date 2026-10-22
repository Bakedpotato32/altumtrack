import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X, Printer, Layers, Award, AlertCircle, Image, Download,
  MessageCircle, Users, CheckCircle2, Calendar, FileText
} from 'lucide-react';
import {
  exportElementAsPNG,
  exportElementAsPDF,
  shareElementToWhatsApp
} from '../utils/exportHelper';

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
  const [exportingStatus, setExportingStatus] = useState('');

  const bulkRef = useRef(null);

  // Filter students by selected class
  const classStudents = students.filter(s => s.className === selectedClass);

  // Ranked students for Result Gazette
  const rankedClassStudents = [...classStudents].sort((a, b) => {
    return getStudentMetrics(b).percentage - getStudentMetrics(a).percentage;
  });

  // Defaulters list for selected class
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

  const handleExport = async (type) => {
    if (!bulkRef.current) return;
    try {
      setExportingStatus(`Exporting ${type.toUpperCase()}...`);
      const fileBase = `Class_${selectedClass}_${docType.toUpperCase()}_Altumtrack`;
      const caption = `Official *${docType.toUpperCase().replace('_', ' ')}* for *Class ${selectedClass}* from *${schoolInfo.name}* (${schoolInfo.session}).`;

      if (type === 'png') {
        await exportElementAsPNG(bulkRef.current, fileBase, `Class ${selectedClass} ${docType}`);
      } else if (type === 'pdf') {
        await exportElementAsPDF(bulkRef.current, fileBase, `Class ${selectedClass} ${docType} PDF`);
      } else if (type === 'whatsapp') {
        await shareElementToWhatsApp(bulkRef.current, fileBase, caption, '');
      }
    } catch (err) {
      alert('Export failed: ' + (err?.message || 'Error generating document'));
    } finally {
      setExportingStatus('');
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
        className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-white max-h-[94vh] overflow-y-auto space-y-4 text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-orange-500 text-white flex items-center justify-center shadow">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Bulk Class Print & Gazette Studio</h3>
              <p className="text-[11px] text-slate-500">Generate class-wide Merit Gazettes, Defaulter Sheets & Batch Admit Cards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {exportingStatus && (
          <div className="p-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-center">
            ✨ {exportingStatus}
          </div>
        )}

        {/* Controls: Class Selector & Document Type */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50 p-3 rounded-2xl border">
          {/* Class Selector */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Target Class:</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border font-bold text-slate-800"
            >
              {classes.map(c => (
                <option key={c} value={c}>Class {c} ({students.filter(s => s.className === c).length} Students)</option>
              ))}
            </select>
          </div>

          {/* Doc Type Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl">
            {[
              { id: 'merit', label: 'Merit Gazette', icon: Award },
              { id: 'defaulter', label: 'Defaulter Sheet', icon: AlertCircle },
              { id: 'admit_batch', label: 'Batch Admit Cards', icon: Printer }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setDocType(t.id)}
                  className={`py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
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
            className="py-2.5 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1 shadow active:scale-95 transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print / System PDF
          </button>
          <button
            onClick={() => handleExport('png')}
            className="py-2.5 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center gap-1 shadow active:scale-95 transition"
          >
            <Image className="w-3.5 h-3.5" /> Save PNG
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="py-2.5 rounded-xl bg-fuchsia-600 text-white font-bold flex items-center justify-center gap-1 shadow active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF File
          </button>
          <button
            onClick={() => handleExport('whatsapp')}
            className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1 shadow active:scale-95 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Sheet
          </button>
        </div>

        {/* ================= BULK PREVIEW CANVAS ================= */}
        <div ref={bulkRef} className="bg-white p-2 rounded-2xl">
          {/* ================= 1. MERIT LIST / RESULT GAZETTE ================= */}
          {docType === 'merit' && (
            <div className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-slate-300 shadow-xl space-y-4">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {schoolInfo.logo && (
                    <img src={schoolInfo.logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border" />
                  )}
                  <div>
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-violet-600 text-white">
                      OFFICIAL RESULT GAZETTE & MERIT RANK LIST
                    </span>
                    <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1">{schoolInfo.name}</h2>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {schoolInfo.examName} • Academic Session {schoolInfo.session}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-xl bg-violet-100 text-violet-800 font-black text-xs">
                    Class {selectedClass}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{classStudents.length} Candidates</p>
                </div>
              </div>

              {rankedClassStudents.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No students found enrolled in Class {selectedClass}.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-2.5 text-center">Rank</th>
                        <th className="p-2.5 text-center">Roll</th>
                        <th className="p-2.5">Student Name</th>
                        {subjects.map(s => (
                          <th key={s} className="p-2.5 text-center">{s.slice(0, 4)}</th>
                        ))}
                        <th className="p-2.5 text-center">Total</th>
                        <th className="p-2.5 text-center">%</th>
                        <th className="p-2.5 text-center">Grade</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rankedClassStudents.map((st, idx) => {
                        const m = getStudentMetrics(st);
                        const termKey = schoolInfo.examName.replace(/[^a-zA-Z0-9]/g, '_');
                        const termMarks = st.termMarks?.[termKey] || st.marks || {};
                        return (
                          <tr key={st.id} className={idx < 3 ? 'bg-amber-50/50 font-semibold' : 'bg-white'}>
                            <td className="p-2 text-center font-black">
                              {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                            </td>
                            <td className="p-2 text-center font-bold text-slate-500">#{st.rollNo}</td>
                            <td className="p-2 font-extrabold text-slate-900">{st.name}</td>
                            {subjects.map(sub => (
                              <td key={sub} className="p-2 text-center text-slate-700">
                                {termMarks[sub] ?? 80}
                              </td>
                            ))}
                            <td className="p-2 text-center font-black text-slate-900">{m.total}/{m.maxTotal}</td>
                            <td className="p-2 text-center font-black text-violet-700">{m.percentage}%</td>
                            <td className="p-2 text-center font-black text-slate-800">{m.grade}</td>
                            <td className="p-2 text-center font-extrabold">
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
                <span>Class Teacher Signature: ___________________</span>
                <span>Examination Incharge: ___________________</span>
                <span className="font-bold text-slate-900">{schoolInfo.principal} (Principal Seal)</span>
              </div>
            </div>
          )}

          {/* ================= 2. CLASS FEE DEFAULTERS MASTER SHEET ================= */}
          {docType === 'defaulter' && (
            <div className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-slate-300 shadow-xl space-y-4">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {schoolInfo.logo && (
                    <img src={schoolInfo.logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border" />
                  )}
                  <div>
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-rose-600 text-white">
                      OFFICIAL FEE COLLECTION & DEFAULTER STATEMENT
                    </span>
                    <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1">{schoolInfo.name}</h2>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Class {selectedClass} • Academic Session {schoolInfo.session}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-black text-xs">
                    Pending Due: ₹{totalClassDue.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{defaulterStudents.length} Defaulters in Class</p>
                </div>
              </div>

              {defaulterStudents.length === 0 ? (
                <div className="p-8 text-center text-emerald-600 font-extrabold">
                  ✓ Outstanding! 100% of fees in Class {selectedClass} are cleared with zero dues!
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-2.5 text-center">Roll</th>
                        <th className="p-2.5">Student Name</th>
                        <th className="p-2.5">Father / Guardian</th>
                        <th className="p-2.5">Contact Phone</th>
                        <th className="p-2.5 text-right">Total Package</th>
                        <th className="p-2.5 text-right">Amount Paid</th>
                        <th className="p-2.5 text-right">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {defaulterStudents.map(st => {
                        const due = Math.max(0, Number(st.totalFee || 0) - Number(st.paidFee || 0));
                        return (
                          <tr key={st.id} className="bg-white">
                            <td className="p-2.5 text-center font-bold text-slate-500">#{st.rollNo}</td>
                            <td className="p-2.5 font-extrabold text-slate-900">{st.name}</td>
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
                <span>Accounts Officer: ___________________</span>
                <span>Class Teacher: ___________________</span>
                <span className="font-bold text-slate-900">{schoolInfo.principal} (Principal Seal)</span>
              </div>
            </div>
          )}

          {/* ================= 3. BATCH ADMIT CARDS ================= */}
          {docType === 'admit_batch' && (
            <div className="space-y-6">
              {classStudents.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No students enrolled in Class {selectedClass}.</p>
              ) : (
                classStudents.map((st, i) => (
                  <div
                    key={st.id}
                    className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-slate-300 shadow-xl space-y-4 print:break-after-page"
                    style={{ pageBreakAfter: 'always' }}
                  >
                    <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {st.photo && (
                          <img src={st.photo} alt="Student" className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-300" />
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

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div><p className="text-[10px] text-slate-400 font-bold">CANDIDATE</p><p className="font-extrabold text-slate-900">{st.name}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold">ROLL NO</p><p className="font-extrabold text-violet-700">#{st.rollNo}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold">CLASS</p><p className="font-bold">{st.className}-{st.section}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold">GUARDIAN</p><p className="font-bold">{st.parentName}</p></div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="p-2">Subject</th>
                            <th className="p-2">Code</th>
                            <th className="p-2">Exam Date</th>
                            <th className="p-2">Shift & Hall</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {subjects.map((sub, idx) => {
                            const sched = getSubjectSchedule(sub, idx);
                            return (
                              <tr key={sub}>
                                <td className="p-2 font-bold">{sub}</td>
                                <td className="p-2 font-mono text-slate-500">{sched.code}</td>
                                <td className="p-2 font-extrabold text-violet-700">{formatNiceDate(sched.date)}</td>
                                <td className="p-2 text-slate-600">{sched.shift} ({sched.room})</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 border-t border-dashed flex items-center justify-between text-[10px] text-slate-500">
                      <span>Candidate Signature</span>
                      <span className="font-bold text-slate-900">{schoolInfo.principal} (Controller of Exams)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
