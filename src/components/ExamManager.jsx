import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet, Calendar, Sparkles, Printer, Award,
  Clock, MapPin, Hash, CheckCircle2, Users, Search, X, ChevronLeft, ChevronRight, Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GlassSelect from './GlassSelect';

export default function ExamManager({
  students,
  classSubjects,
  schoolInfo,
  setSchoolInfo,
  timetable,
  setTimetable,
  examTerms,
  subjectMarksConfig,
  onMarkChange,
  onOpenReportCard,
  onOpenPromotionModal,
  onOpenCurriculumModal,
  metricsMap
}) {
  const [subTab, setSubTab] = useState('marks');
  const [selectedClassFilter, setSelectedClassFilter] = useState('10th');
  const [examSearch, setExamSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [autoStartDate, setAutoStartDate] = useState('2026-11-10');
  const [autoGapDays, setAutoGapDays] = useState(2);
  const [defaultShift, setDefaultShift] = useState('09:30 AM - 12:30 PM');
  const [defaultRoom, setDefaultRoom] = useState('Main Hall - Block A');

  // Subjects for the currently selected class
  const activeClassSubjects = classSubjects?.[selectedClassFilter] || classSubjects?.['10th'] || [];

  // Helper to get max and pass marks for a subject
  const getSubjectConfig = (subject) => {
    const config = subjectMarksConfig?.[schoolInfo.examName]?.[selectedClassFilter]?.[subject];
    return {
      maxMarks: config?.maxMarks ?? 100,
      passMarks: config?.passMarks ?? 33
    };
  };

  const filteredStudents = useMemo(() => {
    const q = examSearch.trim().toLowerCase();
    return students.filter(s => {
      const matchClass = selectedClassFilter === 'All' || s.className === selectedClassFilter;
      const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
      const matchQuery = !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.includes(q) ||
        s.id.toLowerCase().includes(q);
      return matchClass && matchSection && matchQuery;
    });
  }, [students, selectedClassFilter, sectionFilter, examSearch]);

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, page]);

  const uniqueClasses = ['All', ...Array.from(new Set(students.map(s => s.className)))];

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
      [subject]: { ...current, [field]: value }
    });
  };

  const handleAutoGenerateSchedule = () => {
    const updated = { ...timetable };
    let currentDate = new Date(autoStartDate || '2026-11-10');

    activeClassSubjects.forEach((sub, idx) => {
      if (idx > 0) currentDate.setDate(currentDate.getDate() + Number(autoGapDays || 1));
      if (currentDate.getDay() === 0) currentDate.setDate(currentDate.getDate() + 1);

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
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      {/* Top Switcher Bar */}
      <div className="flex items-center justify-between no-print gap-2">
        <div className="p-1.5 rounded-[22px] glass-dock flex gap-1.5 overflow-x-auto flex-1">
          {[
            { id: 'marks', label: 'Marks Register', icon: FileSpreadsheet },
            { id: 'timetable', label: 'Timetable', icon: Calendar },
            { id: 'notice', label: 'Date-Sheet Notice', icon: Printer }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black whitespace-nowrap transition ${
                  subTab === t.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenPromotionModal}
          className="px-3 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1 shrink-0"
        >
          <Users className="w-3.5 h-3.5" /> Promotion
        </button>
      </div>

      {/* Active Exam Term & Custom Curriculum Button Card */}
      <div className="p-4 rounded-[26px] glass-card space-y-3 text-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Active Examination Term
            </label>
            <GlassSelect
              value={schoolInfo.examName}
              onChange={val => setSchoolInfo({ ...schoolInfo, examName: val })}
              options={examTerms}
              title="Select Active Exam Term"
              placeholder="Choose Exam Term..."
            />
          </div>

          {/* Curriculum & Max Marks Config Launcher */}
          <button
            type="button"
            onClick={onOpenCurriculumModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 active:scale-95 transition shrink-0"
          >
            <Sliders className="w-4 h-4" />
            <span>Customize Subjects & Max Marks</span>
          </button>
        </div>
      </div>

      {/* 1. MARKS REGISTER */}
      {subTab === 'marks' && (
        <div className="space-y-3.5">
          {/* Search & Section Controls */}
          <div className="p-3.5 rounded-[26px] glass-card space-y-2.5 no-print">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search student by name, roll no, or ID in marks register..."
                value={examSearch}
                onChange={e => { setExamSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/80 border border-slate-200 text-xs font-semibold focus:outline-none"
              />
              {examSearch && (
                <button onClick={() => setExamSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
                {uniqueClasses.map(c => (
                  <button
                    key={c}
                    onClick={() => { setSelectedClassFilter(c); setPage(1); }}
                    className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 transition ${
                      selectedClassFilter === c
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                        : 'bg-white/70 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {c === 'All' ? 'All Classes' : `Class ${c}`}
                  </button>
                ))}
              </div>

              <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl shrink-0 text-[11px] font-black">
                {['All', 'A', 'B'].map(sec => (
                  <button
                    key={sec}
                    onClick={() => { setSectionFilter(sec); setPage(1); }}
                    className={`px-2.5 py-0.5 rounded-lg transition ${
                      sectionFilter === sec ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Sec {sec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-500">
            <span>Showing {paginatedStudents.length} of {filteredStudents.length} Students</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1 rounded-lg bg-white/80 border disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-700 font-black">Page {page} of {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-lg bg-white/80 border disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Student Cards List */}
          {paginatedStudents.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-[26px] text-slate-400">
              <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-bold">No students found matching your search</p>
            </div>
          ) : (
            paginatedStudents.map(student => {
              const m = metricsMap?.[student.id] || { total: 0, maxTotal: 100, percentage: 0, grade: 'F', passed: false, classRank: 1 };
              const termKey = schoolInfo.examName.replace(/[^a-zA-Z0-9]/g, '_');
              const studentTermMarks = student.termMarks?.[termKey] || student.marks || {};
              const subjectsForStudent = classSubjects?.[student.className] || activeClassSubjects;

              return (
                <div key={student.id} className="p-4 rounded-[26px] glass-card space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-black text-sm text-slate-900">
                        {student.name}{' '}
                        <span className="text-xs font-bold text-blue-600">
                          ({student.className}-{student.section} • Roll #{student.rollNo})
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        Score: <b>{m.total}/{m.maxTotal}</b> • Rank: <b className="text-amber-600">#{m.classRank}</b> • Status:{' '}
                        <b className={m.passed ? 'text-emerald-600' : 'text-rose-600'}>
                          {m.passed ? 'PASSED' : 'RETEST'}
                        </b>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-blue-600 text-white shadow-sm">
                        {m.percentage}% ({m.grade})
                      </span>
                      <button
                        onClick={() => onOpenReportCard(student)}
                        className="text-xs font-black px-3 py-1 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition"
                      >
                        Report Card →
                      </button>
                    </div>
                  </div>

                  {/* Subject Input Grid (Displays specific configured Max Marks!) */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {subjectsForStudent.map(sub => {
                      const cfg = getSubjectConfig(sub);
                      const score = Number(studentTermMarks[sub] ?? cfg.maxMarks * 0.8);
                      const failedSub = score < cfg.passMarks;
                      return (
                        <div
                          key={sub}
                          className={`p-2.5 rounded-2xl border transition ${
                            failedSub ? 'bg-rose-50/70 border-rose-200' : 'bg-white/60 border-slate-200/70'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-slate-400 truncate">{sub}</label>
                            <span className="text-[9px] text-slate-400 font-semibold">/{cfg.maxMarks}</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max={cfg.maxMarks}
                            value={score}
                            onChange={e => onMarkChange(student.id, sub, e.target.value, termKey)}
                            className={`w-full mt-0.5 font-black text-base bg-transparent focus:outline-none ${
                              failedSub ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. TIMETABLE BUILDER */}
      {subTab === 'timetable' && (
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl space-y-3">
            <h3 className="text-base font-black">1-Tap Auto-Schedule All Subjects</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-slate-800">
              <div className="bg-white/95 p-2.5 rounded-2xl">
                <label className="text-[9px] font-black uppercase text-slate-400 block">First Exam Date</label>
                <input
                  type="date"
                  value={autoStartDate}
                  onChange={e => setAutoStartDate(e.target.value)}
                  className="w-full font-bold text-xs bg-transparent mt-0.5"
                />
              </div>
              <div className="bg-white/95 p-2.5 rounded-2xl">
                <label className="text-[9px] font-black uppercase text-slate-400 block">Gap Between Exams</label>
                <select
                  value={autoGapDays}
                  onChange={e => setAutoGapDays(Number(e.target.value))}
                  className="w-full font-bold text-xs bg-transparent mt-0.5"
                >
                  <option value={1}>Daily (No Gap)</option>
                  <option value={2}>1 Day Gap</option>
                  <option value={3}>2 Days Gap</option>
                </select>
              </div>
              <div className="bg-white/95 p-2.5 rounded-2xl">
                <label className="text-[9px] font-black uppercase text-slate-400 block">Shift Timing</label>
                <input
                  type="text"
                  value={defaultShift}
                  onChange={e => setDefaultShift(e.target.value)}
                  className="w-full font-bold text-xs bg-transparent mt-0.5"
                />
              </div>
              <div className="bg-white/95 p-2.5 rounded-2xl">
                <label className="text-[9px] font-black uppercase text-slate-400 block">Exam Hall</label>
                <input
                  type="text"
                  value={defaultRoom}
                  onChange={e => setDefaultRoom(e.target.value)}
                  className="w-full font-bold text-xs bg-transparent mt-0.5"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoGenerateSchedule}
              className="w-full py-2.5 rounded-2xl bg-white text-blue-700 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Auto-Generate Timetable (Skips Sundays!)
            </button>
          </div>

          <div className="p-4 rounded-[28px] glass-card space-y-3">
            <h3 className="font-black text-sm text-slate-800">Subject Schedule Matrix</h3>
            <div className="space-y-2.5">
              {activeClassSubjects.map((sub, idx) => {
                const sched = getSubjectSchedule(sub, idx);
                return (
                  <div key={sub} className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-blue-700">{sub}</span>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                        {formatNiceDate(sched.date)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Code</label>
                        <input
                          type="text"
                          value={sched.code}
                          onChange={e => handleScheduleChange(sub, 'code', e.target.value, idx)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                        <input
                          type="date"
                          value={sched.date}
                          onChange={e => handleScheduleChange(sub, 'date', e.target.value, idx)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Shift</label>
                        <input
                          type="text"
                          value={sched.shift}
                          onChange={e => handleScheduleChange(sub, 'shift', e.target.value, idx)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Hall</label>
                        <input
                          type="text"
                          value={sched.room}
                          onChange={e => handleScheduleChange(sub, 'room', e.target.value, idx)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border font-bold"
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

      {/* 3. NOTICE SHEET */}
      {subTab === 'notice' && (
        <div className="space-y-3">
          <div className="flex justify-end no-print">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" /> Print Notice
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xl space-y-4">
            <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
              <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-blue-600 text-white">
                EXAMINATION DATE-SHEET NOTICE
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900">{schoolInfo.name}</h2>
              <p className="text-xs text-slate-500 font-semibold">{schoolInfo.examName} • {schoolInfo.session}</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-2.5">Date & Day</th>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Timing</th>
                    <th className="p-2.5">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeClassSubjects.map((sub, idx) => {
                    const sched = getSubjectSchedule(sub, idx);
                    return (
                      <tr key={sub}>
                        <td className="p-2.5 font-extrabold text-blue-700">{formatNiceDate(sched.date)}</td>
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
          </div>
        </div>
      )}
    </motion.div>
  );
}
