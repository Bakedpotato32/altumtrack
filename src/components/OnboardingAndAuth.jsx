import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, School, MapPin, ShieldCheck, Upload,
  ArrowRight, CheckCircle2, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function SetupWizard({ schoolInfo, setSchoolInfo, onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    tagline: 'Excellence in Modern Education',
    board: 'CBSE Affiliated',
    affiliationNo: '2130492',
    schoolCode: '65412',
    address: 'Sector 14, Knowledge Park',
    phone: '9876543210',
    email: 'admin@altumschool.edu.in',
    principal: 'Dr. R. K. Sharma',
    session: '2026-2027',
    examName: 'FINAL TERM EXAMINATION 2026',
    adminPin: '1234',
    logo: ''
  });

  const isDemoTriggered = form.name.toLowerCase().includes('altumisbest');

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const finishSetup = (e) => {
    e.preventDefault();
    let finalSchoolName = form.name.trim();
    if (isDemoTriggered) {
      finalSchoolName = finalSchoolName.replace(/altumisbest/gi, '').trim() || 'Altum International Academy';
    }
    const updated = { ...form, name: finalSchoolName, isConfigured: true };
    setSchoolInfo(updated);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    onComplete(isDemoTriggered);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-[32px] bg-white border border-slate-200/80 shadow-2xl p-6 space-y-5"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Setup Wizard • Step {step} of 3
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-0.5">Welcome to Altumtrack</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <form onSubmit={finishSetup} className="space-y-4">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5 text-xs">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <School className="w-4 h-4 text-blue-600" /> 1. School Identity & Branding
              </h2>

              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                    LOGO
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-slate-800">School Emblem / Logo</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold cursor-pointer mt-1">
                    <Upload className="w-3.5 h-3.5" /> Upload Image
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase">School Full Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. St. Xavier International School"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isDemoTriggered ? (
                  <div className="mt-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Secret Keyword Detected! 50 Students/Class + Staff will be generated.</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    (Tip: Type <b className="text-blue-600">altumisbest</b> to preload 50 demo students/class, or leave as real name for a 100% clean app!)
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase">School Motto / Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-50 border font-semibold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500 uppercase">Board</label>
                  <input
                    type="text"
                    value={form.board}
                    onChange={e => setForm({ ...form, board: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase">Affiliation No.</label>
                  <input
                    type="text"
                    value={form.affiliationNo}
                    onChange={e => setForm({ ...form, affiliationNo: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-semibold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg"
              >
                Next: Address & Principal <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5 text-xs">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" /> 2. Address & Administration
              </h2>

              <div>
                <label className="font-bold text-slate-500 uppercase">School Address *</label>
                <input
                  required
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500 uppercase">Principal Name</label>
                  <input
                    type="text"
                    value={form.principal}
                    onChange={e => setForm({ ...form, principal: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase">Helpline Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow"
                >
                  Next: Admin PIN <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-xs">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 3. Set 4-Digit Security PIN
              </h2>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2">
                <label className="font-black text-blue-900 uppercase block">Admin Lock Screen PIN</label>
                <input
                  required
                  type="password"
                  maxLength={4}
                  value={form.adminPin}
                  onChange={e => setForm({ ...form, adminPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  className="w-40 mx-auto text-center tracking-[0.6em] font-black text-2xl py-2 rounded-xl bg-white border-2 border-blue-300 text-slate-900 focus:outline-none"
                />
                <p className="text-[11px] text-blue-700 font-semibold">Default PIN is 1234</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isDemoTriggered ? 'Launch with 50 Students/Class' : 'Launch Clean School ERP'}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}

export function LoginScreen({ schoolInfo, onUnlock, onReconfigure }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d) => {
    if (pin.length < 4) {
      const next = pin + d;
      setPin(next);
      setError(false);
      if (next.length === 4) {
        if (next === (schoolInfo.adminPin || '1234')) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-[32px] bg-white border border-slate-200/80 shadow-2xl p-6 text-center space-y-5"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <GraduationCap className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
            ALTUMTRACK ADMIN PORTAL
          </span>
          <h1 className="text-lg font-black text-slate-900 mt-1 line-clamp-1">{schoolInfo.name || 'School ERP'}</h1>
          <p className="text-xs text-slate-400 font-medium">Session {schoolInfo.session} • Enter 4-Digit Admin PIN</p>
        </div>

        <div className="flex justify-center gap-3.5 py-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                error
                  ? 'bg-rose-500 scale-110'
                  : pin.length > i
                  ? 'bg-blue-600 scale-110 shadow-md shadow-blue-500/40'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-xs font-bold text-rose-600">Incorrect PIN! Try again.</p>}

        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-blue-50 active:scale-95 font-black text-lg text-slate-800 transition"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={onReconfigure}
            className="h-12 rounded-2xl bg-slate-50 text-[10px] font-bold text-slate-400 hover:text-blue-700"
          >
            Setup
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-blue-50 active:scale-95 font-black text-lg text-slate-800 transition"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => setPin(pin.slice(0, -1))}
            className="h-12 rounded-2xl bg-rose-50 text-xs font-bold text-rose-600 active:scale-95"
          >
            DEL
          </button>
        </div>
      </motion.div>
    </div>
  );
}
