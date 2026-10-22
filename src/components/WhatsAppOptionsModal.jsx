import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, Share2, ClipboardCheck, PhoneCall, Sparkles } from 'lucide-react';

export default function WhatsAppOptionsModal({
  parentName,
  phone,
  documentTitle,
  onClose,
  onSelectOption
}) {
  const cleanPhone = (phone || '').replace(/\D/g, '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.94, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 15 }}
        className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-xs"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">Send to Parent WhatsApp</h4>
              <p className="text-[10px] text-slate-400">{documentTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {cleanPhone ? (
          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase text-emerald-700">Target Parent Number</span>
              <p className="font-black text-emerald-900 text-sm mt-0.5">+91 {cleanPhone}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">{parentName || 'Parent / Guardian'}</p>
            </div>
            <PhoneCall className="w-5 h-5 text-emerald-600" />
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
            ⚠️ No phone number saved for this student. Use "Attach File in WhatsApp" to pick contact.
          </div>
        )}

        <div className="space-y-2 pt-1">
          {cleanPhone && (
            <button
              onClick={() => onSelectOption('direct')}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-left shadow-md flex items-center justify-between group active:scale-95 transition"
            >
              <div>
                <p className="font-black text-xs flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-white" /> 1. Open Parent Chat Directly
                </p>
                <p className="text-[10px] text-emerald-100 font-medium mt-0.5">
                  Opens WhatsApp for +91 {cleanPhone} with details & image on clipboard!
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </button>
          )}

          <button
            onClick={() => onSelectOption('native_share')}
            className="w-full p-3.5 rounded-2xl bg-slate-900 text-white font-black text-left shadow flex items-center justify-between active:scale-95 transition"
          >
            <div>
              <p className="font-black text-xs flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-emerald-400" /> 2. Attach Image File via WhatsApp
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Pops up WhatsApp media screen with the image already attached.
              </p>
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
