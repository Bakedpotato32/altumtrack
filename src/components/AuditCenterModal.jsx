import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, History, Trash2, RotateCcw, CheckCircle2, AlertTriangle,
  UserPlus, CreditCard, Edit3, ShieldAlert
} from 'lucide-react';

export default function AuditCenterModal({
  auditLogs,
  trashedStudents,
  onClose,
  onUndoAction,
  onRestoreStudent,
  onPermanentDeleteStudent,
  onClearLogs
}) {
  const [tab, setTab] = useState('activity'); // activity | trash

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'ADMISSION':
        return { bg: 'bg-violet-100 text-violet-700', icon: UserPlus, label: 'Admission' };
      case 'FEE_PAID':
        return { bg: 'bg-emerald-100 text-emerald-700', icon: CreditCard, label: 'Fee Collected' };
      case 'FEE_REVERT':
        return { bg: 'bg-amber-100 text-amber-800', icon: RotateCcw, label: 'Fee Reverted' };
      case 'PROFILE_EDIT':
        return { bg: 'bg-cyan-100 text-cyan-700', icon: Edit3, label: 'Profile Edited' };
      case 'STUDENT_TRASHED':
        return { bg: 'bg-rose-100 text-rose-700', icon: Trash2, label: 'Moved to Trash' };
      default:
        return { bg: 'bg-slate-100 text-slate-700', icon: History, label: 'System Action' };
    }
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
        className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-white max-h-[90vh] overflow-y-auto space-y-4 text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Audit History & Recycle Bin</h3>
              <p className="text-[11px] text-slate-500">Every change is saved • Undo mistakes anytime</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Switcher: Activity Log vs Recycle Bin */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setTab('activity')}
            className={`py-2 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition ${
              tab === 'activity' ? 'bg-violet-600 text-white shadow' : 'text-slate-600'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Activity Log ({auditLogs.length})
          </button>
          <button
            onClick={() => setTab('trash')}
            className={`py-2 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition ${
              tab === 'trash' ? 'bg-rose-600 text-white shadow' : 'text-slate-600'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Recycle Bin ({trashedStudents.length})
          </button>
        </div>

        {/* TAB 1: TIMESTAMPED ACTIVITY & 1-TAP UNDO */}
        {tab === 'activity' && (
          <div className="space-y-2.5">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <History className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">No actions recorded yet</p>
                <p className="text-[11px]">Fee collections, edits, and deletions will appear here with 1-tap Undo.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recent Database Events</span>
                  <button
                    onClick={onClearLogs}
                    className="text-[10px] font-bold text-slate-400 hover:text-rose-600"
                  >
                    Clear History Log
                  </button>
                </div>

                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {auditLogs.map(item => {
                    const style = getBadgeStyle(item.type);
                    const Icon = style.icon;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${style.bg}`}>
                              <Icon className="w-3 h-3" /> {style.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="font-bold text-slate-800 truncate">{item.description}</p>
                        </div>

                        {item.canUndo && !item.undone && (
                          <button
                            onClick={() => onUndoAction(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 hover:bg-violet-700 transition"
                          >
                            <RotateCcw className="w-3 h-3" /> Undo
                          </button>
                        )}
                        {item.undone && (
                          <span className="text-[10px] font-bold text-emerald-600 shrink-0">✓ Reverted</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: RECYCLE BIN (DELETED STUDENTS RECOVERY) */}
        {tab === 'trash' && (
          <div className="space-y-2.5">
            {trashedStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Trash2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">Recycle Bin is Empty</p>
                <p className="text-[11px]">Any student you delete is safely held here so you can restore them anytime.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[55vh] overflow-y-auto">
                {trashedStudents.map(st => (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                        {st.id}
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{st.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        Class {st.className}-{st.section} • Roll #{st.rollNo} • Paid ₹{Number(st.paidFee).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => onRestoreStudent(st.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                      <button
                        onClick={() => onPermanentDeleteStudent(st.id)}
                        className="p-1.5 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
