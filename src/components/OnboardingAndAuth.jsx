import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, School, MapPin, ShieldCheck, Upload,
  Lock, ArrowRight, CheckCircle2, Sparkles, KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function SetupWizard({ schoolInfo, setSchoolInfo, onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...schoolInfo });

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
    const updated = { ...form, isConfigured: true };
    setSchoolInfo(updated);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-400/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-fuchsia-400/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-3xl backdrop-blur-2xl bg-white/85 border border-white shadow-2xl p-6 space-y-5"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-violet-500/30">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                First-Time Setup • Step {step} of 3
              </span>
              <h1 className="text-xl font-black text-slate-900 mt-0.5">Welcome to Altumtrack</h1>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <form onSubmit={finishSetup} className="space-y-4">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5 text-xs">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <School className="w-4 h-4 text-violet-600" /> 1. School Identity & Branding
              </h2>

              {/* Logo Picker */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border border-violet-200" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center font-black text-xs">
                    LOGO
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-slate-700">School Crest / Logo</p>
                  <p className="text-[11px] text-slate-400 mb-1.5">Appears on Admit Cards, Results & Receipts</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold cursor-pointer">
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
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase">School Motto / Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase">Board / Affiliation</label>
                  <input
                    type="text"
                    value={form.board}
                    onChange={e => setForm({ ...form, board: e.target.value })}
                    placeholder="CBSE / ICSE / State"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase">Affiliation No.</label>
                  <input
                    type="text"
                    value={form.affiliationNo}
                    onChange={e => setForm({ ...form, affiliationNo: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/30"
              >
                Next: Campus & Session <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5 text-xs">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-fuchsia-600" /> 2. Address & Academic Session
              </h2>

              <div>
                <label className="font-bold text-slate-500 uppercase">Full School Address *</label>
                <input
                  required
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase">Official Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase">Principal Name</label>
                  <input
                    type="text"
                    value={form.principal}
                    onChange={e => setForm({ ...form, principal: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase">Academic Session</label>
                  <input
                    type="text"
                    value={form.session}
                    onChange={e => setForm({ ...form, session: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase">School Code</label>
                  <input
                    type="text"
                    value={form.schoolCode}
                    onChange={e => setForm({ ...form, schoolCode: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg"
                >
                  Next: Security PIN <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-xs">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 3. Set Admin Security PIN
              </h2>
              <p className="text-slate-500">
                This 4-digit PIN locks your school database, fee collection, and marks register when you close the app.
              </p>

              <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 text-center space-y-2">
                <label className="font-black text-violet-700 uppercase block">Create 4-Digit Admin PIN</label>
                <input
                  required
                  type="password"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={form.adminPin}
                  onChange={e => setForm({ ...form, adminPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  className="w-40 mx-auto text-center tracking-[0.6em] font-black text-2xl py-2.5 rounded-xl bg-white border-2 border-violet-300 text-slate-900 focus:outline-none focus:border-violet-600"
                />
                <p className="text-[11px] text-violet-600 font-semibold">Default is 1234 (Change to any 4 digits)</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30"
                >
                  <CheckCircle2 className="w-4 h-4" /> Launch Altumtrack ERP
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-400/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-cyan-400/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-sm rounded-3xl backdrop-blur-2xl bg-white/85 border border-white shadow-2xl p-6 text-center space-y-5"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-orange-400 p-0.5 shadow-xl shadow-violet-500/30">
          {schoolInfo.logo ? (
            <img src={schoolInfo.logo} alt="School" className="w-full h-full object-cover rounded-2xl bg-white" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <GraduationCap className="w-8 h-8" />
            </div>
          )}
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
            ALTUMTRACK ADMIN PORTAL
          </span>
          <h1 className="text-lg font-black text-slate-900 mt-1 line-clamp-1">{schoolInfo.name}</h1>
          <p className="text-xs text-slate-500 font-medium">Session {schoolInfo.session} • Enter 4-Digit Admin PIN</p>
        </div>

        {/* 4 PIN Dots */}
        <div className="flex justify-center gap-3.5 py-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                error
                  ? 'bg-rose-500 scale-110'
                  : pin.length > i
                  ? 'bg-violet-600 scale-110 shadow-md shadow-violet-500/40'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-xs font-bold text-rose-600">Incorrect PIN! Try again.</p>}

        {/* Glass Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              className="h-12 rounded-2xl bg-slate-100/90 hover:bg-violet-100 active:scale-95 font-black text-lg text-slate-800 transition shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={onReconfigure}
            className="h-12 rounded-2xl bg-slate-100/60 text-[10px] font-bold text-slate-500 hover:text-violet-700"
          >
            Setup
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-slate-100/90 hover:bg-violet-100 active:scale-95 font-black text-lg text-slate-800 transition shadow-sm"
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
