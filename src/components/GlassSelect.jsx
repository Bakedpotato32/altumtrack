import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';

export default function GlassSelect({
  value,
  onChange,
  options = [],
  title = "Select Option",
  placeholder = "Choose...",
  icon: IconComponent = null
}) {
  const [isOpen, setIsOpen] = useState(false);

  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label || opt.value };
    }
    return { value: String(opt), label: String(opt) };
  });

  const selectedItem = normalizedOptions.find(o => o.value === value) || { label: value || placeholder };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full p-2.5 rounded-2xl glass-pill flex items-center justify-between gap-2 text-left active:scale-[0.98] transition border border-white/80"
      >
        <div className="flex items-center gap-2 min-w-0">
          {IconComponent && (
            <IconComponent className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span className="font-black text-xs text-slate-800 truncate">
            {selectedItem.label}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {/* PORTAL TO BODY: Prevents any header or parent container overlap */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                className="relative z-10 w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] bg-white/95 backdrop-blur-2xl p-5 shadow-2xl border border-white max-h-[75vh] flex flex-col space-y-3"
              >
                <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-1 mb-1" />

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <h4 className="font-black text-sm text-slate-900">{title}</h4>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-100 text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 max-h-[50vh]">
                  {normalizedOptions.map(opt => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition ${
                          isSelected
                            ? 'bg-blue-50 border border-blue-400 shadow-sm text-blue-900'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className={`text-xs ${isSelected ? 'font-black' : 'font-bold'}`}>
                          {opt.label}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
