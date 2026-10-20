import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Edit3, Save, Phone, MessageCircle, Award, CreditCard,
  FileText, Upload, Trash2, UserCheck
} from 'lucide-react';

export default function StudentDetailModal({
  student,
  classes,
  schoolInfo,
  metrics,
  onClose,
  onUpdateStudent,
  onDeleteStudent,
  onOpenStudio
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...student });

  if (!student) return null;

  const due = Number(student.totalFee || 0) - Number(student.paidFee || 0);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateStudent({
      ...form,
      totalFee: Number(form.totalFee) || 0,
      paidFee: Number(form.paidFee) || 0
    });
    setIsEditing(false);
  };

  const sendWhatsAppSummary = () => {
    const cleanPhone = (student.phone || '').replace(/\D/g, '');
    const msg = `Hello ${student.parentName || 'Parent'},\n\nOfficial update from *${schoolInfo.name}* (${schoolInfo.session}):\n• Student: *${student.name}* (Class ${student.className}-${student.section}, Roll #${student.rollNo})\n• Exam Performance: *${metrics.percentage}% (Grade ${metrics.grade})*\n• Fee Status: Paid ₹${Number(student.paidFee).toLocaleString()} / Total ₹${Number(student.totalFee).toLocaleString()} (*Pending Due: ₹${due.toLocaleString()}*)\n\nThank you,\nAdmin Office`;
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-3.5"
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-white max-h-[90vh] overflow-y-auto space-y-4 text-xs"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            {form.photo ? (
              <img src={form.photo} alt={form.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-violet-500" />
            ) : (
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${student.avatarColor} text-white font-black text-lg flex items-center justify-center shadow`}>
                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-violet-100 text-violet-700">
                {student.id}
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{student.name}</h3>
              <p className="text-xs font-bold text-slate-500">
                Class {student.className}-{student.section} • Roll #{student.rollNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1.5 rounded-xl bg-violet-50 text-violet-700 font-bold flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode vs Edit Mode */}
        {!isEditing ? (
          <div className="space-y-4">
            {/* Quick Parent Contact & WhatsApp Bar */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${student.phone}`}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-violet-600" /> Call Parent ({student.phone})
              </a>
              <button
                onClick={sendWhatsAppSummary}
                className="py-2.5 px-3 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Report
              </button>
            </div>

            {/* 360 Info Grid */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Student Aadhaar</p>
                <p className="font-mono font-extrabold text-slate-800">{student.studentAadhar || 'Not Recorded'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">DOB / Age / Blood</p>
                <p className="font-bold text-slate-800">{student.dob} ({student.age || '15'} yrs) • {student.bloodGroup}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Father's Name</p>
                <p className="font-bold text-slate-800">{student.parentName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Mother's Name</p>
                <p className="font-bold text-slate-800">{student.motherName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Parent Aadhaar</p>
                <p className="font-mono font-bold text-slate-800">{student.parentAadhar || 'Not Recorded'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Transport / Bus</p>
                <p className="font-bold text-slate-800">{student.busRoute || 'Self'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</p>
                <p className="font-bold text-slate-800">{student.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Previous School</p>
                <p className="font-bold text-slate-800">{student.previousSchool || 'N/A'} ({student.previousGrade || '-'})</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Previous TC No.</p>
                <p className="font-bold text-slate-800">{student.tcNo || 'N/A'}</p>
              </div>
            </div>

            {/* Financial & Academic Summary */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Fee Ledger</p>
                <p className="text-sm font-black text-emerald-800 mt-0.5">
                  Paid ₹{Number(student.paidFee).toLocaleString()} / ₹{Number(student.totalFee).toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-rose-600">
                  {due === 0 ? '✓ Cleared in Full' : `Pending: ₹${due.toLocaleString()}`}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-violet-50 border border-violet-200">
                <p className="text-[10px] font-bold text-violet-700 uppercase">Academic Standing</p>
                <p className="text-sm font-black text-violet-800 mt-0.5">
                  {metrics.percentage}% • Grade {metrics.grade}
                </p>
                <p className="text-[10px] font-bold text-slate-600">
                  Total: {metrics.total}/{metrics.maxTotal}
                </p>
              </div>
            </div>

            {/* Quick Document Studio Launchers */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">1-Tap Official Document Generator</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {[
                  { mode: 'admit', label: 'Admit Card' },
                  { mode: 'result', label: 'Report Card' },
                  { mode: 'idcard', label: 'ID Card' },
                  { mode: 'tc', label: 'Transfer Cert' },
                  { mode: 'bonafide', label: 'Bonafide Cert' }
                ].map(doc => (
                  <button
                    key={doc.mode}
                    onClick={() => onOpenStudio(student, doc.mode)}
                    className="py-2 px-2 rounded-xl bg-slate-900 text-white font-bold text-[10px] hover:bg-violet-700 transition text-center"
                  >
                    {doc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  onDeleteStudent(student.id);
                  onClose();
                }}
                className="text-rose-600 font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Student Record
              </button>
            </div>
          </div>
        ) : (
          /* EDIT FORM */
          <form onSubmit={handleSave} className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border">
              <label className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Change Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <span className="text-[11px] text-slate-500">Updates student portrait across all cards</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2">
                <label className="font-bold text-slate-400 uppercase">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase">Roll No</label>
                <input
                  type="text"
                  value={form.rollNo}
                  onChange={e => setForm({ ...form, rollNo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase">Class & Sec</label>
                <div className="flex gap-1 mt-1">
                  <select
                    value={form.className}
                    onChange={e => setForm({ ...form, className: e.target.value })}
                    className="flex-1 px-2 py-2 rounded-xl bg-slate-50 border font-bold"
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={form.section}
                    onChange={e => setForm({ ...form, section: e.target.value })}
                    className="w-16 px-2 py-2 rounded-xl bg-slate-50 border font-bold"
                  >
                    {['A', 'B', 'C'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase">Student Aadhaar</label>
                <input
                  type="text"
                  value={form.studentAadhar || ''}
                  onChange={e => setForm({ ...form, studentAadhar: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase">Phone</label>
                <input
                  type="text"
                  value={form.phone || ''}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase">Father Name</label>
                <input
                  type="text"
                  value={form.parentName || ''}
                  onChange={e => setForm({ ...form, parentName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase">Mother Name</label>
                <input
                  type="text"
                  value={form.motherName || ''}
                  onChange={e => setForm({ ...form, motherName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase">Total Annual Fee (₹)</label>
                <input
                  type="number"
                  value={form.totalFee}
                  onChange={e => setForm({ ...form, totalFee: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase">Paid Fee (₹)</label>
                <input
                  type="number"
                  value={form.paidFee}
                  onChange={e => setForm({ ...form, paidFee: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-violet-600 text-white font-black flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Save className="w-4 h-4" /> Save Profile Changes
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
