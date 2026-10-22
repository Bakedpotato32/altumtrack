import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Award, CheckCircle2, MessageSquareQuote, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const REMARK_PRESETS = [
  'Outstanding academic dedication and disciplined conduct.',
  'Consistent performer with strong analytical problem-solving skills.',
  'Creative thinker with enthusiastic participation in school activities.',
  'Polite and cooperative; shows great potential with consistent effort.',
  'Has shown admirable progress; encouraged to focus more during revisions.'
];

export default function CoScholasticEditorModal({
  student,
  coScholasticList,
  onClose,
  onSave
}) {
  const [grades, setGrades] = useState(student.coScholastic || {
    'Work Education & Skill': 'A',
    'Art & Cultural Education': 'A',
    'Health & Physical Education': 'A',
    'Discipline & Ethical Conduct': 'A'
  });

  const [remarks, setRemarks] = useState(
    student.teacherRemarks || 'Consistent performer with strong analytical problem-solving skills.'
  );

  const handleGradeChange = (act, val) => {
    setGrades({ ...grades, [act]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(student.id, { coScholastic: grades, teacherRemarks: remarks });
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3"
    >
      <motion.form
        initial={{ scale: 0.94, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 15 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-violet-100 text-violet-700">
              Part 2 Assessment
            </span>
            <h4 className="font-black text-slate-900 text-sm mt-0.5">{student.name} ({student.className}-{student.section})</h4>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {/* 4 Co-Scholastic Activities */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-bold uppercase text-slate-400 block">
            Co-Scholastic & Discipline Grading (A / B / C)
          </label>
          {coScholasticList.map(activity => (
            <div key={activity} className="p-2.5 rounded-2xl bg-slate-50 border flex items-center justify-between">
              <span className="font-extrabold text-slate-800">{activity}</span>
              <div className="flex gap-1">
                {['A', 'B', 'C'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGradeChange(activity, g)}
                    className={`w-8 h-8 rounded-xl font-black text-xs transition ${
                      grades[activity] === g
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Teacher Remarks */}
        <div className="space-y-2 pt-2 border-t">
          <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <MessageSquareQuote className="w-3.5 h-3.5 text-violet-600" /> Class Teacher Final Remarks
          </label>

          <textarea
            rows={3}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 border font-medium text-slate-800"
          />

          <div className="flex gap-1 overflow-x-auto pb-1">
            {REMARK_PRESETS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRemarks(preset)}
                className="px-2.5 py-1 rounded-xl bg-violet-50 text-violet-700 font-bold text-[10px] whitespace-nowrap hover:bg-violet-100 border border-violet-200"
              >
                <Sparkles className="w-2.5 h-2.5 inline mr-1" /> Preset {i + 1}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-violet-600 text-white font-black text-xs shadow-md shadow-violet-500/20"
        >
          Save Assessment to Report Card
        </button>
      </motion.form>
    </motion.div>
  );
}
