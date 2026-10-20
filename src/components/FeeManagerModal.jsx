import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, CreditCard, History, Printer, MessageCircle, RotateCcw,
  Sliders, CheckCircle2
} from 'lucide-react';

export default function FeeManagerModal({
  student,
  schoolInfo,
  classFeeBreakdown,
  feeLogs,
  onClose,
  onRecordPayment,
  onDeleteLog,
  onUpdateFeeAdjustments,
  onOpenReceipt
}) {
  const [subTab, setSubTab] = useState('collect'); // collect | customize | history
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI / QR');
  const [remark, setRemark] = useState('Tuition Installment');

  // Per-student adjustments
  const [transportFee, setTransportFee] = useState(student.transportFee ?? 0);
  const [discount, setDiscount] = useState(student.discount ?? 0);
  const [lateFine, setLateFine] = useState(student.lateFine ?? 0);

  const basePackage =
    (classFeeBreakdown?.admissionFee || 0) +
    (classFeeBreakdown?.tuitionFee || 0) +
    (classFeeBreakdown?.examFee || 0) +
    (classFeeBreakdown?.annualCharges || 0);

  const due = Math.max(0, Number(student.totalFee || 0) - Number(student.paidFee || 0));
  const studentLogs = feeLogs.filter(l => l.studentId === student.id);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) return;
    onRecordPayment(student.id, val, `${paymentMode} • ${remark}`);
    setAmount('');
  };

  const handleSaveAdjustments = (e) => {
    e.preventDefault();
    const tFee = Number(transportFee) || 0;
    const disc = Number(discount) || 0;
    const fine = Number(lateFine) || 0;
    const newTotal = Math.max(0, basePackage + tFee + fine - disc);
    onUpdateFeeAdjustments(student.id, {
      transportFee: tFee,
      discount: disc,
      lateFine: fine,
      totalFee: newTotal
    });
    setSubTab('collect');
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
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
              Pro Fee & Installment Desk
            </span>
            <h3 className="font-black text-slate-900 text-sm mt-0.5">
              {student.name} ({student.className}-{student.section} • Roll #{student.rollNo})
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border text-center">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Net Payable</p>
            <p className="font-black text-sm text-slate-800">₹{Number(student.totalFee).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Paid So Far</p>
            <p className="font-black text-sm text-emerald-600">₹{Number(student.paidFee).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Balance Due</p>
            <p className="font-black text-sm text-rose-600">₹{due.toLocaleString()}</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setSubTab('collect')}
            className={`py-2 rounded-xl font-extrabold transition ${
              subTab === 'collect' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600'
            }`}
          >
            + Collect Fee
          </button>
          <button
            onClick={() => setSubTab('customize')}
            className={`py-2 rounded-xl font-extrabold transition ${
              subTab === 'customize' ? 'bg-violet-600 text-white shadow' : 'text-slate-600'
            }`}
          >
            Discounts/Bus
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`py-2 rounded-xl font-extrabold transition ${
              subTab === 'history' ? 'bg-slate-900 text-white shadow' : 'text-slate-600'
            }`}
          >
            Logs ({studentLogs.length})
          </button>
        </div>

        {/* SUB-TAB 1: COLLECT PARTIAL OR FULL PAYMENT */}
        {subTab === 'collect' && (
          <div className="space-y-3">
            {due > 0 ? (
              <form onSubmit={handlePaymentSubmit} className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-900">Enter Custom Amount Paying Today</span>
                  <button
                    type="button"
                    onClick={() => setAmount(String(due))}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900"
                  >
                    Fill Full ₹{due.toLocaleString()}
                  </button>
                </div>

                <div>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 3200"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 font-black text-base text-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 rounded-xl bg-white border font-bold text-slate-800"
                    >
                      <option>UPI / QR</option>
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Cheque / DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Installment Note</label>
                    <input
                      type="text"
                      value={remark}
                      onChange={e => setRemark(e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 rounded-xl bg-white border font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black shadow-md shadow-emerald-500/20"
                >
                  Confirm & Record Installment
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-center">
                ✓ All Dues Cleared for {schoolInfo.session}!
              </div>
            )}

            <button
              onClick={() => onOpenReceipt(student)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-extrabold flex items-center justify-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" /> Open Itemized Fee Receipt (PNG / PDF / WA)
            </button>
          </div>
        )}

        {/* SUB-TAB 2: CUSTOMIZE DISCOUNTS, TRANSPORT & LATE FINES */}
        {subTab === 'customize' && (
          <form onSubmit={handleSaveAdjustments} className="space-y-3 p-3.5 rounded-2xl bg-violet-50/60 border border-violet-200">
            <div className="flex justify-between text-[11px] font-bold text-slate-600 border-b border-violet-200 pb-2">
              <span>Class {student.className} Base Fee Package:</span>
              <b>₹{basePackage.toLocaleString()}</b>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  + Bus / Transport Fee Add-On (₹)
                </label>
                <input
                  type="number"
                  value={transportFee}
                  onChange={e => setTransportFee(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-700 uppercase">
                  - Scholarship / Sibling Discount (₹)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border font-bold text-emerald-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-rose-600 uppercase">
                  + Late Fee Fine / Misc Charge (₹)
                </label>
                <input
                  type="number"
                  value={lateFine}
                  onChange={e => setLateFine(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border font-bold text-rose-600"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border flex justify-between items-center">
              <span className="font-bold text-slate-600">Updated Net Payable:</span>
              <span className="font-black text-base text-violet-700">
                ₹{Math.max(0, basePackage + (Number(transportFee) || 0) + (Number(lateFine) || 0) - (Number(discount) || 0)).toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-black shadow"
            >
              Save Student Fee Adjustments
            </button>
          </form>
        )}

        {/* SUB-TAB 3: INSTALLMENT AUDIT TRAIL */}
        {subTab === 'history' && (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {studentLogs.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No installments recorded yet.</p>
            ) : (
              studentLogs.map(log => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border flex items-center justify-between">
                  <div>
                    <span className="font-black text-emerald-700 text-sm">₹{log.amount.toLocaleString()}</span>
                    <span className="text-slate-600 font-semibold ml-1.5">({log.remark})</span>
                    <p className="text-[10px] text-slate-400">{new Date(log.date).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => onDeleteLog(log.id, student.id, log.amount)}
                    className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold text-[10px] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Undo
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
