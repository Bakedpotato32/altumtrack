import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Wallet, Users, DollarSign, TrendingUp, TrendingDown,
  Plus, Trash2, Printer, Image, Download, MessageCircle,
  FileText, CheckCircle2, Calendar, Building2, Fuel, Zap,
  BookOpen, Briefcase, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  exportElementAsPNG,
  exportElementAsPDF,
  shareElementToWhatsApp
} from '../utils/exportHelper';

const EXPENSE_CATEGORIES = [
  { id: 'utilities', label: 'Electricity & Water', icon: Zap },
  { id: 'transport', label: 'Bus Diesel & Maintenance', icon: Fuel },
  { id: 'rent', label: 'Campus Rent / Infrastructure', icon: Building2 },
  { id: 'stationery', label: 'Exam Papers & Stationery', icon: BookOpen },
  { id: 'events', label: 'Sports & Annual Functions', icon: Award },
  { id: 'misc', label: 'Miscellaneous Office Cost', icon: Briefcase }
];

export default function FinanceLedgerModal({
  schoolInfo,
  totalCollectedFee,
  staffList,
  setStaffList,
  expenseList,
  setExpenseList,
  salaryPayouts,
  setSalaryPayouts,
  onClose,
  recordAudit
}) {
  const [tab, setTab] = useState('overview'); // overview | staff | expenses
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [salaryModalStaff, setSalaryModalStaff] = useState(null);
  const [salarySlipData, setSalarySlipData] = useState(null);
  const [exportStatus, setExportStatus] = useState('');

  // Form states for new staff
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Teacher',
    subject: 'Mathematics',
    phone: '',
    salary: 28000,
    joinDate: new Date().toISOString().slice(0, 10)
  });

  // Form states for new expense
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Electricity & Water',
    amount: 3500,
    date: new Date().toISOString().slice(0, 10),
    paymentMode: 'UPI / QR',
    note: ''
  });

  // Form states for paying salary
  const [payoutForm, setPayoutForm] = useState({
    month: 'October 2026',
    bonus: 0,
    deductions: 0,
    paymentMode: 'Bank Transfer',
    note: 'Monthly Base Salary'
  });

  const salarySlipRef = useRef(null);

  // Financial Calculations
  const totalSalariesPaid = salaryPayouts.reduce((acc, s) => acc + Number(s.netAmount || 0), 0);
  const totalExpensesPaid = expenseList.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const totalOutflow = totalSalariesPaid + totalExpensesPaid;
  const netSurplus = Number(totalCollectedFee || 0) - totalOutflow;
  const isSurplus = netSurplus >= 0;

  // Add Staff
  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name) return;
    const staffEntry = {
      ...newStaff,
      id: 'STF-' + Math.floor(100 + Math.random() * 900),
      salary: Number(newStaff.salary) || 0
    };
    setStaffList([staffEntry, ...staffList]);
    setShowAddStaffModal(false);
    setNewStaff({
      name: '',
      role: 'Teacher',
      subject: 'Mathematics',
      phone: '',
      salary: 28000,
      joinDate: new Date().toISOString().slice(0, 10)
    });
    if (recordAudit) recordAudit('STAFF_ADD', `Appointed ${staffEntry.name} as ${staffEntry.role}`);
  };

  // Add Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    const val = Number(newExpense.amount);
    if (!newExpense.title || !val) return;
    const expenseEntry = {
      ...newExpense,
      id: 'EXP-' + Date.now(),
      amount: val
    };
    setExpenseList([expenseEntry, ...expenseList]);
    setShowAddExpenseModal(false);
    setNewExpense({
      title: '',
      category: 'Electricity & Water',
      amount: 3500,
      date: new Date().toISOString().slice(0, 10),
      paymentMode: 'UPI / QR',
      note: ''
    });
    if (recordAudit) recordAudit('EXPENSE_ADD', `Logged expense ₹${val.toLocaleString()} for ${newExpense.title}`);
  };

  // Confirm Salary Payout
  const handlePaySalary = (e) => {
    e.preventDefault();
    if (!salaryModalStaff) return;
    const base = Number(salaryModalStaff.salary) || 0;
    const bonus = Number(payoutForm.bonus) || 0;
    const ded = Number(payoutForm.deductions) || 0;
    const net = Math.max(0, base + bonus - ded);

    const payoutRecord = {
      id: 'PAY-' + Date.now(),
      staffId: salaryModalStaff.id,
      staffName: salaryModalStaff.name,
      role: salaryModalStaff.role,
      phone: salaryModalStaff.phone,
      month: payoutForm.month,
      baseSalary: base,
      bonus,
      deductions: ded,
      netAmount: net,
      paymentMode: payoutForm.paymentMode,
      date: new Date().toISOString(),
      slipNo: `SLIP-${Date.now().toString().slice(-4)}`
    };

    setSalaryPayouts([payoutRecord, ...salaryPayouts]);
    setSalaryModalStaff(null);
    setSalarySlipData(payoutRecord);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    if (recordAudit) recordAudit('SALARY_PAID', `Paid ₹${net.toLocaleString()} salary to ${payoutRecord.staffName} (${payoutRecord.month})`);
  };

  // Export Salary Slip
  const runSalarySlipExport = async (type) => {
    if (!salarySlipRef.current || !salarySlipData) return;
    try {
      setExportStatus(`Exporting ${type.toUpperCase()}...`);
      const fileBase = `SalarySlip_${salarySlipData.staffName.replace(/\s+/g, '_')}_${salarySlipData.slipNo}`;
      const caption = `Official Salary Slip from *${schoolInfo.name}*:\n• Staff: *${salarySlipData.staffName}* (${salarySlipData.role})\n• Month: *${salarySlipData.month}*\n• Net Paid: *₹${salarySlipData.netAmount.toLocaleString()}* via ${salarySlipData.paymentMode}\n\nAccounts Office`;

      if (type === 'png') {
        await exportElementAsPNG(salarySlipRef.current, fileBase, 'Official Salary Slip');
      } else if (type === 'pdf') {
        await exportElementAsPDF(salarySlipRef.current, fileBase, 'Salary Slip PDF');
      } else if (type === 'whatsapp') {
        await shareElementToWhatsApp(salarySlipRef.current, fileBase, caption, salarySlipData.phone);
      }
    } catch (err) {
      alert('Export failed: ' + (err?.message || 'Error'));
    } finally {
      setExportStatus('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3"
    >
      <motion.div
        initial={{ scale: 0.94, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 15 }}
        className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-white max-h-[92vh] overflow-y-auto space-y-4 text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">School Finance & Staff Ledger</h3>
              <p className="text-[11px] text-slate-500">Track Fee Revenue, Teacher Salaries & Operational Costs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: 'overview', label: 'Net Cashflow', icon: TrendingUp },
            { id: 'staff', label: `Staff & Salaries (${staffList.length})`, icon: Users },
            { id: 'expenses', label: `Expenses (${expenseList.length})`, icon: DollarSign }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-2 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition ${
                  tab === t.id ? 'bg-emerald-600 text-white shadow' : 'text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= 1. FINANCIAL OVERVIEW / NET CASHFLOW ================= */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Net Operating Balance Banner */}
            <div className={`p-5 rounded-3xl text-white shadow-xl ${
              isSurplus
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600'
                : 'bg-gradient-to-r from-rose-600 to-orange-600'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md">
                {isSurplus ? '✓ Operating Surplus (Profit)' : '⚠️ Operating Deficit'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">
                ₹{Math.abs(netSurplus).toLocaleString()}
              </h2>
              <p className="text-white/85 text-xs mt-1">
                Net School Reserve Balance for Session {schoolInfo.session}
              </p>
            </div>

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-50 border">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Fee Inflow</p>
                <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">
                  ₹{Number(totalCollectedFee || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Salaries Paid</p>
                <p className="text-base sm:text-lg font-black text-violet-700 mt-0.5">
                  ₹{totalSalariesPaid.toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Campus Expenses</p>
                <p className="text-base sm:text-lg font-black text-rose-600 mt-0.5">
                  ₹{totalExpensesPaid.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="py-3 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4 text-emerald-400" /> Log School Expense
              </button>
              <button
                onClick={() => setTab('staff')}
                className="py-3 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Users className="w-4 h-4" /> Issue Salary Payout
              </button>
            </div>
          </div>
        )}

        {/* ================= 2. STAFF & SALARY PAYOUTS ================= */}
        {tab === 'staff' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Staff Directory & Payroll</h4>
                <p className="text-slate-400 text-[11px]">Issue monthly salary slips & send via WhatsApp</p>
              </div>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Staff
              </button>
            </div>

            <div className="space-y-2">
              {staffList.map(st => (
                <div key={st.id} className="p-3.5 rounded-2xl bg-slate-50 border flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 text-sm">{st.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700">
                        {st.role} • {st.subject}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Base Salary: <b className="text-slate-800">₹{Number(st.salary).toLocaleString()}/mo</b> • Phone: {st.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSalaryModalStaff(st)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow"
                    >
                      Pay Salary →
                    </button>
                    <button
                      onClick={() => setStaffList(staffList.filter(s => s.id !== st.id))}
                      className="p-2 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Salary Payout History */}
            {salaryPayouts.length > 0 && (
              <div className="pt-3 border-t space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Recent Salary Slips Issued</span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {salaryPayouts.map(p => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-slate-900">{p.staffName}</span>
                        <span className="text-emerald-700 ml-1.5 font-bold">₹{p.netAmount.toLocaleString()}</span>
                        <p className="text-[9px] text-slate-400">{p.month} • {p.paymentMode} ({p.slipNo})</p>
                      </div>
                      <button
                        onClick={() => setSalarySlipData(p)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 font-bold text-emerald-800"
                      >
                        View Slip
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 3. SCHOOL EXPENSES ================= */}
        {tab === 'expenses' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Operating Expenses Ledger</h4>
                <p className="text-slate-400 text-[11px]">Electricity, bus diesel, stationery & maintenance</p>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" /> Log Expense
              </button>
            </div>

            <div className="space-y-2 max-h-[55vh] overflow-y-auto">
              {expenseList.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No expenses logged yet. Tap "Log Expense" to add your first bill.</p>
              ) : (
                expenseList.map(e => (
                  <div key={e.id} className="p-3 rounded-2xl bg-slate-50 border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800">{e.title}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {e.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(e.date).toLocaleDateString('en-IN')} • Paid via {e.paymentMode || 'Cash'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-rose-600 text-sm">-₹{Number(e.amount).toLocaleString()}</span>
                      <button
                        onClick={() => setExpenseList(expenseList.filter(item => item.id !== e.id))}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD STAFF */}
        <AnimatePresence>
          {showAddStaffModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleAddStaff} className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-black text-slate-900">Add Staff Member</h4>
                  <button type="button" onClick={() => setShowAddStaffModal(false)}><X className="w-4 h-4" /></button>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Staff Full Name *</label>
                  <input required type="text" placeholder="e.g. Priya Sharma" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                    <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-50 border font-bold">
                      <option>Teacher</option>
                      <option>Principal / Admin</option>
                      <option>Bus Driver</option>
                      <option>Lab Assistant</option>
                      <option>Support Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Subject / Dept</label>
                    <input type="text" value={newStaff.subject} onChange={e => setNewStaff({ ...newStaff, subject: e.target.value })} className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-50 border font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Salary (₹)</label>
                    <input required type="number" value={newStaff.salary} onChange={e => setNewStaff({ ...newStaff, salary: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-black text-emerald-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                    <input type="text" placeholder="9876543210" value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-black shadow">Save Staff Record</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL: ADD EXPENSE */}
        <AnimatePresence>
          {showAddExpenseModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleAddExpense} className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-black text-slate-900">Log School Expense</h4>
                  <button type="button" onClick={() => setShowAddExpenseModal(false)}><X className="w-4 h-4" /></button>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Expense Title / Item *</label>
                  <input required type="text" placeholder="e.g. October Electricity Bill" value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                    <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-50 border font-bold">
                      {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (₹) *</label>
                    <input required type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-black text-rose-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Mode</label>
                    <select value={newExpense.paymentMode} onChange={e => setNewExpense({ ...newExpense, paymentMode: e.target.value })} className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-50 border font-bold">
                      <option>UPI / QR</option>
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                    <input type="date" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} className="w-full mt-1 px-2 py-2 rounded-xl bg-slate-50 border font-bold" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black shadow">Record Expense</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL: PAY SALARY */}
        <AnimatePresence>
          {salaryModalStaff && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handlePaySalary} className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h4 className="font-black text-slate-900">Salary Payout</h4>
                    <p className="text-[10px] text-slate-400">{salaryModalStaff.name} ({salaryModalStaff.role})</p>
                  </div>
                  <button type="button" onClick={() => setSalaryModalStaff(null)}><X className="w-4 h-4" /></button>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border flex justify-between items-center font-bold">
                  <span>Base Monthly Salary:</span>
                  <span className="text-sm font-black text-slate-900">₹{Number(salaryModalStaff.salary).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Payout Month</label>
                    <input type="text" value={payoutForm.month} onChange={e => setPayoutForm({ ...payoutForm, month: e.target.value })} className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-50 border font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Mode</label>
                    <select value={payoutForm.paymentMode} onChange={e => setPayoutForm({ ...payoutForm, paymentMode: e.target.value })} className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-50 border font-bold">
                      <option>Bank Transfer</option>
                      <option>UPI / QR</option>
                      <option>Cash</option>
                      <option>Cheque</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">+ Bonus (₹)</label>
                    <input type="number" value={payoutForm.bonus} onChange={e => setPayoutForm({ ...payoutForm, bonus: e.target.value })} className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-50 border font-bold text-emerald-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-rose-600 uppercase">- Deductions (₹)</label>
                    <input type="number" value={payoutForm.deductions} onChange={e => setPayoutForm({ ...payoutForm, deductions: e.target.value })} className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-50 border font-bold text-rose-600" />
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between font-black text-emerald-800">
                  <span>Net Payable Amount:</span>
                  <span className="text-base">
                    ₹{Math.max(0, Number(salaryModalStaff.salary) + (Number(payoutForm.bonus) || 0) - (Number(payoutForm.deductions) || 0)).toLocaleString()}
                  </span>
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-black shadow">Confirm Payout & Issue Slip</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL: OFFICIAL SALARY SLIP PREVIEW & EXPORT */}
        <AnimatePresence>
          {salarySlipData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
              <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-500">Official Staff Salary Slip</span>
                  <button onClick={() => setSalarySlipData(null)}><X className="w-4 h-4" /></button>
                </div>

                {/* Printable Salary Slip Card */}
                <div ref={salarySlipRef} className="p-5 rounded-2xl bg-white border-2 border-slate-300 space-y-3.5 text-xs">
                  <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-violet-600 text-white">
                        STAFF SALARY VOUCHER
                      </span>
                      <h3 className="font-black text-base text-slate-900 mt-1">{schoolInfo.name}</h3>
                      <p className="text-[10px] text-slate-500">{schoolInfo.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400">SLIP NO</p>
                      <p className="font-mono font-black text-slate-900">{salarySlipData.slipNo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-3 rounded-xl border text-[11px]">
                    <div><span>Employee:</span> <b>{salarySlipData.staffName}</b></div>
                    <div><span>Designation:</span> <b>{salarySlipData.role}</b></div>
                    <div><span>Pay Period:</span> <b>{salarySlipData.month}</b></div>
                    <div><span>Payment Mode:</span> <b>{salarySlipData.paymentMode}</b></div>
                  </div>

                  <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="p-2 text-left">Salary Heads</th>
                          <th className="p-2 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr><td className="p-2">Base Monthly Salary</td><td className="p-2 text-right font-bold">{salarySlipData.baseSalary.toLocaleString()}</td></tr>
                        {salarySlipData.bonus > 0 && (
                          <tr><td className="p-2 text-emerald-700">+ Bonus / Allowance</td><td className="p-2 text-right font-bold text-emerald-700">+{salarySlipData.bonus.toLocaleString()}</td></tr>
                        )}
                        {salarySlipData.deductions > 0 && (
                          <tr><td className="p-2 text-rose-600">- Deductions / Advance</td><td className="p-2 text-right font-bold text-rose-600">-{salarySlipData.deductions.toLocaleString()}</td></tr>
                        )}
                        <tr className="bg-emerald-50/70 font-black text-emerald-900 text-xs">
                          <td className="p-2">Net Salary Disbursed</td>
                          <td className="p-2 text-right">₹{salarySlipData.netAmount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-6 border-t border-dashed flex justify-between text-[10px] text-slate-500">
                    <span>Employee Signature</span>
                    <span className="font-bold text-slate-900">{schoolInfo.principal} (Principal Seal)</span>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => runSalarySlipExport('png')} className="py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <Image className="w-3.5 h-3.5" /> Save PNG
                  </button>
                  <button onClick={() => runSalarySlipExport('pdf')} className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <Download className="w-3.5 h-3.5" /> Save PDF
                  </button>
                  <button onClick={() => runSalarySlipExport('whatsapp')} className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
