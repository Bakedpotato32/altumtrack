import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, History, Printer, MessageCircle, RotateCcw } from 'lucide-react';

export default function FeeManagerModal({
  student,
  schoolInfo,
  feeLogs,
  onClose,
  onRecordPayment,
  onDeleteLog,
  onOpenReceipt
}) {
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('Tuition Fee Installment');

  const due = Number(student.totalFee || 0) - Number(student.paidFee || 0);
  const studentLogs = feeLogs.filter(l => l.studentId === student.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) return;
    onRecordPayment(student.id, val, remark);
    setAmount('');
  };

  const sendWhatsAppReceipt = () => {
    const cleanPhone = (student.phone || '').replace(/\D/g, '');
    const msg = `Official Fee Receipt from *${schoolInfo.name}*:\n• Student: *${student.name}* (Class ${student.className})\n• Total Fee: ₹${Number(student.totalFee).toLocaleString()}\n• Total Paid: ₹${Number(student.paidFee).toLocaleString()}\n• *Balance Due: ₹${due.toLocaleString()}*\n\nThank you!`;
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
        initial={{ scale: 0.93, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 15 }}
        className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-white max-h-[90vh] overflow-y-auto space-y-4 text-xs"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
              Detailed Fee Ledger
            </span>
            <h3 className="font-black text-slate-900 text-sm mt-0.5">{student.name} ({student.className}-{student.section})</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-50 border text-center">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Package</p>
            <p className="font-black text-sm text-slate-800">₹{Number(student.totalFee).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Paid So Far</p>
            <p className="font-black text-sm text-emerald-600">₹{Number(student.paidFee).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Balance Due</p>
            <p className="font-black text-sm text-rose-600">₹{due.toLocaleString()}</p>
          </div>
        </div>

        {/* Collect Installment Form */}
        {due > 0 ? (
          <form onSubmit={handleSubmit} className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
            <h4 className="font-extrabold text-emerald-800 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Collect Partial or Full Payment
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Amount (₹)</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 3200"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border font-black text-sm text-emerald-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Installment Note</label>
                <input
                  type="text"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border font-semibold text-slate-700"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-black shadow-md"
            >
              Record Payment
            </button>
          </form>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-center">
            ✓ All Fees Fully Cleared!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onOpenReceipt(student)}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Official Receipt
          </button>
          <button
            onClick={sendWhatsAppReceipt}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1 shadow"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
        </div>

        {/* Audit Trail / Payment History Logs */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="font-extrabold text-slate-700 flex items-center gap-1 text-xs">
            <History className="w-3.5 h-3.5 text-violet-600" /> Fee Payment Audit History ({studentLogs.length})
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {studentLogs.length === 0 ? (
              <p className="text-slate-400 text-[11px] italic py-2">No payment logs recorded yet.</p>
            ) : (
              studentLogs.map(log => (
                <div key={log.id} className="p-2 rounded-xl bg-slate-50 border flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-black text-emerald-700">₹{log.amount.toLocaleString()}</span>
                    <span className="text-slate-500 ml-1.5">({log.remark})</span>
                    <p className="text-[9px] text-slate-400">{new Date(log.date).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => onDeleteLog(log.id, student.id, log.amount)}
                    className="p-1 rounded bg-rose-50 text-rose-600 font-bold hover:bg-rose-100"
                    title="Undo / Delete Payment Entry"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
