import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet, Calendar, Sparkles, Printer, Award,
  Clock, MapPin, Hash, CheckCircle2, Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EXAM_TERMS = [
  'UNIT TEST I (2026-27)',
  'HALF-YEARLY EXAMINATION 2026',
  'PRE-BOARD EXAMINATION 2026',
  'FINAL TERM EXAMINATION 2026-27'
];

export default function ExamManager({
  students,
  subjects,
  schoolInfo,
  setSchoolInfo,
  timetable,
  setTimetable,
  examConfig,
  setExamConfig,
  onMarkChange,
  onOpenReportCard,
  getStudentMetrics
}) {
  const [subTab, setSubTab] = useState('marks'); // marks | timetable | notice
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [autoStartDate, setAutoStartDate] = useState('2026-11-10');
  const [autoGapDays, setAutoGapDays] = useState(2);
  const [defaultShift, setDefaultShift] = useState('09:30 AM - 12:30 PM');
  const [defaultRoom, setDefaultRoom] = useState('Main Hall - Block A');

  // Ensure every subject has a timetable entry
  const getSubjectSchedule = (sub, idx) => {
    return timetable[sub] || {
      code: `ALT-${101 + idx}`,
      date: `2026-11-${String(10 + idx * 2).padStart(2, '0')}`,
      shift: '09:30 AM - 12:30 PM',
      room: 'Hall A - Room 102'
    };
  };

  const handleScheduleChange = (subject, field, value, idx) => {
    const current = getSubjectSchedule(subject, idx);
    setTimetable({
      ...timetable,
      [subject]: {
        ...current,
        [field]: value
      }
    });
  };

  // 1-Tap Smart Auto-Schedule (skips Sundays!)
  const handleAutoGenerateSchedule = () => {
    const updated = { ...timetable };
    let currentDate = new Date(autoStartDate || '2026-11-10');

    subjects.forEach((sub, idx) => {
      if (idx > 0) {
        currentDate.setDate(currentDate.getDate() + Number(autoGapDays || 1));
      }
      // Skip Sunday (0)
      if (currentDate.getDay() === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');

      updated[sub] = {
        code: updated[sub]?.code || `ALT-${101 + idx}`,
        date: `${yyyy}-${mm}-${dd}`,
        shift: defaultShift,
        room: defaultRoom
      };
    });

    setTimetable(updated);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  const formatNiceDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const uniqueClasses = ['All', ...Array.from(new Set(students.map(s => s.className)))];
  const visibleStudents = students.filter(
    s => selectedClassFilter === 'All' || s.className === selectedClassFilter
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      {/* Sub-Navigation Pills */}
      <div className="p-2 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-lg flex gap-1.5 overflow-x-auto no-print">
        {[
          { id: 'marks', label: 'Marks Register', icon: FileSpreadsheet },
          { id: 'timetable', label: 'Timetable Builder', icon: Calendar },
          { id: 'notice', label: 'Printable Date-Sheet', icon: Printer }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition ${
                subTab === t.id
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Exam Term & Max Marks Bar */}
      <div className="p-4 rounded-3xl backdrop-blur-xl bg-white/85 border border-white shadow-md space-y-3 text-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">
              Active Examination Term (Synced with Cards)
            </label>
            <div className="flex gap-2 mt-1">
              <select
                value={schoolInfo.examName}
                onChange={e => setSchoolInfo({ ...schoolInfo, examName: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-slate-800"
              >
                {EXAM_TERMS.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-28">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">Max Marks</label>
              <input
                type="number"
                value={examConfig.maxMarks}
                onChange={e => setExamConfig({ ...examConfig, maxMarks: Number(e.target.value) || 100 })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-violet-700"
              />
            </div>
            <div className="w-28">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">Pass Marks</label>
              <input
                type="number"
                value={examConfig.passMarks}
                onChange={e => setExamConfig({ ...examConfig, passMarks: Number(e.target.value) || 33 })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-emerald-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 1. MARKS REGISTER SUB-TAB ================= */}
      {subTab === 'marks' && (
        <div className="space-y-3">
          {/* Class Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {uniqueClasses.map(c => (
              <button
                key={c}
                onClick={() => setSelectedClassFilter(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                  selectedClassFilter === c ? 'bg-violet-600 text-white shadow' : 'bg-white text-slate-600'
                }`}
              >
                {c === 'All' ? 'All Classes' : `Class ${c}`}
              </button>
            ))}
          </div>

          {visibleStudents.map(student => {
            const m = getStudentMetrics(student);
            return (
              <div key={student.id} className="p-4 rounded-3xl bg-white/90 border border-white shadow-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">
                      {student.name}{' '}
                      <span className="text-xs font-bold text-violet-600">
                        ({student.className}-{student.section} • Roll #{student.rollNo})
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Total: <b>{m.total}/{m.maxTotal}</b> • Status:{' '}
                      <b className={m.passed ? 'text-emerald-600' : 'text-rose-600'}>
                        {m.passed ? 'PASSED' : 'NEEDS RETEST'}
                      </b>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-violet-600 text-white">
                      {m.percentage}% ({m.grade})
                    </span>
                    <button
                      onClick={() => onOpenReportCard(student)}
                      className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800"
                    >
                      Result Card →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {subjects.map(sub => {
                    const score = Number(student.marks?.[sub] ?? 80);
                    const failedSub = score < examConfig.passMarks;
                    return (
                      <div
                        key={sub}
                        className={`p-2.5 rounded-2xl border ${
                          failedSub ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase text-slate-500 truncate">{sub}</label>
                          <span className="text-[9px] text-slate-400">/{examConfig.maxMarks}</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={examConfig.maxMarks}
                          value={student.marks?.[sub] ?? 80}
                          onChange={e => onMarkChange(student.id, sub, e.target.value)}
                          className={`w-full mt-0.5 font-black text-base bg-transparent focus:outline-none ${
                            failedSub ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= 2. TIMETABLE BUILDER SUB-TAB ================= */}
      {subTab === 'timetable' && (
        <div className="space-y-4 text-xs">
          {/* Smart Auto-Generator Box */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 text-white shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20">
                  <Sparkles className="w-3 h-3" /> Smart Datesheet Generator
                </span>
                <h3 className="text-base font-black mt-1">1-Tap Auto-Schedule All Subjects</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-slate-800">
              <div className="bg-white/95 p-2.5 rounded-2xl">
                <label className="text-[9px] font-bold uppercase text-slate-400 block">First Exam Date</label>
                <input
                  type="date"
                  value={autoStartDate}
                  onChange={e => setAutoStartDate(e.target.value)}
                  className="w-full font-bold text-xs bg-transparent focus:outline-none mt-0.5"
                />
              </div>
              <div className="bg-white/95 p-2.5 rounded-2xl">
                <label className="text-[9px] font-bold uppercase text-slate-400 block">Gap Between Exams</label>
                <select
                  value={autoGapDays}
                  onChange={e => setAutoGapDays(Number(e.target.value))}
                  className="w-full font-bold text-xs bg-transparent focus:outline-none mt-0.5"
                >
                  <option value={1}>No Gap (Daily)</option>
                  <option value={2}>1 Day Study Gap</option>
                  <option value={3}>2 Days Study Gap</option>
                </select>
              </div>
              <div className="bg-white/95 p-2.5 rounded-2xl">
                <label className="text-[9px] font-bold uppercase text-slate-400 block">Default Shift Timing</label>
                <input
                  type="text"
                  value={defaultShift}
                  onChange={e => setDefaultShift(e.target.value)}
                  className="w-full font-bold text-xs bg-transparent focus:outline-none mt-0.5"
                />
              </div>
              <div className="bg-white/95 p-2.5 rounded-2xl">
                <label className="text-[9px] font-bold uppercase text-slate-400 block">Default Exam Hall</label>
                <input
                  type="text"
                  value={defaultRoom}
                  onChange={e => setDefaultRoom(e.target.value)}
                  className="w-full font-bold text-xs bg-transparent focus:outline-none mt-0.5"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateSchedule}
              className="w-full py-2.5 rounded-2xl bg-white text-violet-700 font-black text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Auto-Generate Exam Timetable (Skips Sundays!)
            </button>
          </div>

          {/* Individual Subject Schedule Cards */}
          <div className="p-4 rounded-3xl bg-white/90 border border-white shadow-md space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">
              Customize Subject-Wise Dates, Codes & Shifts
            </h3>
            <p className="text-[11px] text-slate-500">
              Changes made below immediately appear on all Student Admit Cards.
            </p>

            <div className="space-y-3">
              {subjects.map((sub, idx) => {
                const sched = getSubjectSchedule(sub, idx);
                return (
                  <div key={sub} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-violet-700">{sub}</span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                        {formatNiceDate(sched.date)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Paper Code
                        </label>
                        <input
                          type="text"
                          value={sched.code}
                          onChange={e => handleScheduleChange(sub, 'code', e.target.value, idx)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Exam Date
                        </label>
                        <input
                          type="date"
                          value={sched.date}
                          onChange={e => handleScheduleChange(sub, 'date', e.target.value, idx)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Shift Timing
                        </label>
                        <input
                          type="text"
                          value={sched.shift}
                          onChange={e => handleScheduleChange(sub, 'shift', e.target.value, idx)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Hall / Room
                        </label>
                        <input
                          type="text"
                          value={sched.room}
                          onChange={e => handleScheduleChange(sub, 'room', e.target.value, idx)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. PRINTABLE MASTER DATE-SHEET NOTICE ================= */}
      {subTab === 'notice' && (
        <div className="space-y-3">
          <div className="flex justify-end no-print">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
            >
              <Printer className="w-4 h-4" /> Print Official Date-Sheet Notice
            </button>
          </div>

          <div className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-xl print-only space-y-4">
            <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
              <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-violet-600 text-white">
                OFFICIAL EXAMINATION DATE-SHEET NOTICE
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900">{schoolInfo.name}</h2>
              <p className="text-xs text-slate-500 font-semibold">{schoolInfo.address}</p>
              <p className="text-xs font-extrabold text-violet-700 pt-1">
                {schoolInfo.examName} • Academic Session {schoolInfo.session}
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-2.5">Date & Day</th>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5">Paper Code</th>
                    <th className="p-2.5">Timing</th>
                    <th className="p-2.5">Room / Hall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subjects.map((sub, idx) => {
                    const sched = getSubjectSchedule(sub, idx);
                    return (
                      <tr key={sub}>
                        <td className="p-2.5 font-extrabold text-violet-700">{formatNiceDate(sched.date)}</td>
                        <td className="p-2.5 font-bold text-slate-900">{sub}</td>
                        <td className="p-2.5 font-mono text-slate-500">{sched.code}</td>
                        <td className="p-2.5 text-slate-700">{sched.shift}</td>
                        <td className="p-2.5 font-semibold text-slate-600">{sched.room}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-extrabold text-slate-800 uppercase">Important Instructions for Candidates:</p>
              <p>1. All students must report to their allotted Examination Hall 20 minutes before the shift timing.</p>
              <p>2. Carrying the official Altumtrack Admit Card and School ID Card is mandatory.</p>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs text-slate-500 border-t border-dashed border-slate-300">
              <p>Examination Controller</p>
              <p className="font-bold text-slate-800">{schoolInfo.principal} (Principal)</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
