import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X, Megaphone, Sparkles, Image, Download, MessageCircle,
  BookmarkCheck, Trash2, Calendar, Users, FileText
} from 'lucide-react';
import {
  exportElementAsPNG,
  exportElementAsPDF,
  shareElementToWhatsApp
} from '../utils/exportHelper';

const NOTICE_TEMPLATES = [
  {
    id: 'holiday',
    label: 'Holiday Notice',
    title: 'OFFICIAL HOLIDAY ANNOUNCEMENT',
    subject: 'Closure of School on Account of Upcoming Festival / Holiday',
    audience: 'All Classes (Nursery to 12th)',
    body: 'This is to inform all students, parents, and staff members that the school will remain closed on [INSERT DATE] on account of [FESTIVAL / OCCASION].\n\nRegular academic classes and transport routes will resume as usual from [RESUME DATE] at standard school timings.'
  },
  {
    id: 'ptm',
    label: 'PTM Invite',
    title: 'PARENT-TEACHER MEETING (PTM) INVITATION',
    subject: 'Mandatory Parent-Teacher Interaction & Academic Review',
    audience: 'All Parents & Guardians',
    body: 'We cordially invite all parents and guardians to attend the upcoming Parent-Teacher Meeting (PTM) scheduled on [INSERT DATE] between 09:00 AM and 12:30 PM at the Main School Campus.\n\nWe will discuss your ward’s academic progress, exam performance, and upcoming term preparation. Kindly ensure timely attendance.'
  },
  {
    id: 'exam',
    label: 'Exam Circular',
    title: 'UPCOMING EXAMINATION NOTIFICATION',
    subject: 'Release of Date-Sheet & Admit Card Guidelines',
    audience: 'All Students & Parents',
    body: 'All students and parents are hereby informed that the upcoming examination schedule has been finalized. Official Admit Cards and Date-Sheets are being issued from the school office.\n\nStudents must clear any pending fee dues to collect their Admit Card and must report 20 minutes prior to the examination shift.'
  },
  {
    id: 'fee',
    label: 'Fee Due Circular',
    title: 'FEE INSTALLMENT CLEARANCE REMINDER',
    subject: 'Kind Reminder to Clear Pending School Fee Dues',
    audience: 'Parents & Guardians',
    body: 'Dear Parents, this is a gentle reminder to clear the pending tuition and annual fee installments for the current academic session on or before [INSERT DUE DATE].\n\nYou may pay via UPI, Cash, or Bank Transfer at the school accounts desk and collect your official itemized receipt. Ignore if already paid.'
  },
  {
    id: 'timing',
    label: 'Timing / Uniform',
    title: 'REVISION OF SCHOOL TIMINGS & UNIFORM',
    subject: 'Change in Seasonal School Timings & Dress Code',
    audience: 'All Classes & Bus Routes',
    body: 'Please note that effective from [INSERT DATE], the school will follow the updated seasonal timings: 08:00 AM to 02:00 PM.\n\nAll students are required to attend school in complete prescribed seasonal uniform with their School ID Card.'
  }
];

export default function NoticeStudioModal({
  schoolInfo,
  classes,
  savedNotices,
  setSavedNotices,
  onClose
}) {
  const [activeView, setActiveView] = useState('create'); // create | archive
  const [refNo, setRefNo] = useState(`CIR/${schoolInfo.session}/${Math.floor(100 + Math.random() * 900)}`);
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState(NOTICE_TEMPLATES[0].title);
  const [subject, setSubject] = useState(NOTICE_TEMPLATES[0].subject);
  const [audience, setAudience] = useState(NOTICE_TEMPLATES[0].audience);
  const [body, setBody] = useState(NOTICE_TEMPLATES[0].body);
  const [exporting, setExporting] = useState('');

  const letterheadRef = useRef(null);

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setSubject(tpl.subject);
    setAudience(tpl.audience);
    setBody(tpl.body);
    setRefNo(`CIR/${schoolInfo.session}/${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleSaveToArchive = () => {
    const entry = {
      id: 'NOT-' + Date.now(),
      refNo,
      dateStr,
      title,
      subject,
      audience,
      body
    };
    setSavedNotices([entry, ...savedNotices]);
    setExporting('Saved to Circular Archive!');
    setTimeout(() => setExporting(''), 2000);
  };

  const handleExport = async (type) => {
    if (!letterheadRef.current) return;
    try {
      setExporting(`Generating ${type.toUpperCase()}...`);
      const fileBase = `Circular_${subject.slice(0, 18)}`;
      const caption = `📢 *${title}* — *${schoolInfo.name}*\n• Subject: *${subject}*\n• For: ${audience}\n\n${body}\n\n— *${schoolInfo.principal}* (Principal)`;

      if (type === 'png') {
        await exportElementAsPNG(letterheadRef.current, fileBase, title);
      } else if (type === 'pdf') {
        await exportElementAsPDF(letterheadRef.current, fileBase, title);
      } else if (type === 'whatsapp') {
        await shareElementToWhatsApp(letterheadRef.current, fileBase, caption, '');
      }
    } catch (err) {
      alert('Export failed: ' + (err?.message || 'Error'));
    } finally {
      setExporting('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-md flex items-center justify-center p-3"
    >
      <motion.div
        initial={{ scale: 0.94, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 15 }}
        className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-white max-h-[92vh] overflow-y-auto space-y-4 text-xs"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-orange-500 text-white flex items-center justify-center shadow">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Notice & Circular Letterhead Studio</h3>
              <p className="text-[11px] text-slate-500">Create official school notices & share to WhatsApp groups</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {exporting && (
          <div className="p-2.5 rounded-xl bg-slate-900 text-white font-bold text-center">
            ✨ {exporting}
          </div>
        )}

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveView('create')}
            className={`py-2 rounded-xl font-extrabold transition ${
              activeView === 'create' ? 'bg-violet-600 text-white shadow' : 'text-slate-600'
            }`}
          >
            Compose & Export Circular
          </button>
          <button
            onClick={() => setActiveView('archive')}
            className={`py-2 rounded-xl font-extrabold transition ${
              activeView === 'archive' ? 'bg-slate-900 text-white shadow' : 'text-slate-600'
            }`}
          >
            Saved Archive ({savedNotices.length})
          </button>
        </div>

        {activeView === 'create' ? (
          <div className="space-y-4">
            {/* 1-Tap Quick Templates */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                1-Tap Ready Templates
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {NOTICE_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-extrabold whitespace-nowrap border border-violet-200 transition"
                  >
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Reference No.</label>
                <input
                  type="text"
                  value={refNo}
                  onChange={e => setRefNo(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notice Date</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border font-bold"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Audience</label>
                <select
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border font-bold"
                >
                  <option>All Classes (Nursery to 12th)</option>
                  <option>All Parents & Guardians</option>
                  <option>All Teaching & Non-Teaching Staff</option>
                  {classes.map(c => (
                    <option key={c} value={`Class ${c} Students & Parents`}>
                      Class {c} Only
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Circular Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border font-extrabold text-slate-800"
                />
              </div>
              <div className="col-span-2 sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notice Message Body</label>
                <textarea
                  rows={4}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-white border font-medium text-slate-700 leading-relaxed"
                />
              </div>
            </div>

            {/* LIVE OFFICIAL LETTERHEAD PREVIEW */}
            <div ref={letterheadRef} className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-slate-300 shadow-xl space-y-4">
              <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {schoolInfo.logo && (
                    <img src={schoolInfo.logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border" />
                  )}
                  <div>
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-violet-600 text-white">
                      {title}
                    </span>
                    <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1">{schoolInfo.name}</h2>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {schoolInfo.address} • {schoolInfo.board} (Aff. #{schoolInfo.affiliationNo})
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border">
                <span>Ref: <b className="font-mono text-slate-900">{refNo}</b></span>
                <span>For: <b className="text-violet-700">{audience}</b></span>
                <span>Date: <b>{new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</b></span>
              </div>

              <div className="space-y-2 py-1">
                <p className="font-black text-xs sm:text-sm text-slate-900 underline decoration-violet-400 underline-offset-4">
                  SUBJECT: {subject.toUpperCase()}
                </p>
                <div className="text-xs text-slate-800 leading-6 whitespace-pre-line pt-1">
                  {body}
                </div>
              </div>

              <div className="pt-8 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px] text-slate-600">
                <div>
                  <p className="font-bold text-slate-800">Issued By: Admin Office</p>
                  <p className="text-[10px] text-slate-400">Helpline: {schoolInfo.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">{schoolInfo.principal}</p>
                  <p className="text-[10px] font-bold text-violet-700 uppercase">Principal & Seal</p>
                </div>
              </div>
            </div>

            {/* Export & Archive Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleExport('png')}
                className="py-2.5 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center gap-1 shadow"
              >
                <Image className="w-3.5 h-3.5" /> Save PNG
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="py-2.5 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1 shadow"
              >
                <Download className="w-3.5 h-3.5" /> Save PDF
              </button>
              <button
                type="button"
                onClick={() => handleExport('whatsapp')}
                className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1 shadow"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button
                type="button"
                onClick={handleSaveToArchive}
                className="py-2.5 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center gap-1"
              >
                <BookmarkCheck className="w-3.5 h-3.5" /> Save Copy
              </button>
            </div>
          </div>
        ) : (
          /* ARCHIVE VIEW */
          <div className="space-y-2.5">
            {savedNotices.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No saved circulars yet. Tap "Save Copy" when composing a notice!</p>
            ) : (
              savedNotices.map(item => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-violet-700">{item.refNo} • {item.dateStr}</span>
                    <h4 className="font-extrabold text-slate-900 truncate">{item.subject}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{item.audience}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setRefNo(item.refNo);
                        setDateStr(item.dateStr);
                        setTitle(item.title);
                        setSubject(item.subject);
                        setAudience(item.audience);
                        setBody(item.body);
                        setActiveView('create');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => setSavedNotices(savedNotices.filter(n => n.id !== item.id))}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
