import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowUpRight, GraduationCap, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const CLASS_SEQUENCE = [
  'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th',
  '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'
];

export default function ClassPromotionModal({ students, onClose, onPromoteClass }) {
  const [fromClass, setFromClass] = useState('9th');
  const [toClass, setToClass] = useState('10th');

  const eligibleStudents = students.filter(s => s.className === fromClass);

  const handlePromote = (e) => {
    e.preventDefault();
    if (eligibleStudents.length === 0) return;
    onPromoteClass(fromClass, toClass);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-3.5"
    >
      <motion.div
        initial={{ scale: 0.93, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 15 }}
        className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-white space-y-4 text-xs"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Annual Class Promotion Wizard</h3>
              <p className="text-[11px] text-slate-500">Promote whole batches to the next grade</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handlePromote} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Promote From Class</label>
              <select
                value={fromClass}
                onChange={e => {
                  setFromClass(e.target.value);
                  const idx = CLASS_SEQUENCE.indexOf(e.target.value);
                  if (idx >= 0 && idx < CLASS_SEQUENCE.length - 1) {
                    setToClass(CLASS_SEQUENCE[idx + 1]);
                  }
                }}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 border font-bold text-slate-800"
              >
                {CLASS_SEQUENCE.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-violet-700 uppercase">Promote To Class</label>
              <select
                value={toClass}
                onChange={e => setToClass(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-violet-50 border border-violet-200 font-bold text-violet-800"
              >
                {CLASS_SEQUENCE.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-200 text-violet-900 space-y-1">
            <p className="font-extrabold flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-violet-600" /> {eligibleStudents.length} Students found in Class {fromClass}
            </p>
            <p className="text-[11px] text-violet-700">
              Clicking promote will instantly update their class designation to <b>Class {toClass}</b> for the new academic session.
            </p>
          </div>

          <button
            type="submit"
            disabled={eligibleStudents.length === 0}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black shadow-lg shadow-violet-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Promote {eligibleStudents.length} Students to Class {toClass}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
