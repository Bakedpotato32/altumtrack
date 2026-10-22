import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, ChevronDown, User, Sparkles } from 'lucide-react';

export default function GlassStudentPicker({
  students,
  selectedStudentId,
  onSelect,
  classes = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');

  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(s => {
      const matchClass = classFilter === 'All' || s.className === classFilter;
      const matchQuery = !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.includes(q) ||
        s.id.toLowerCase().includes(q);
      return matchClass && matchQuery;
    });
  }, [students, search, classFilter]);

  const handleSelect = (st) => {
    onSelect(st);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <>
      {/* TRIGGER BUTTON: Stays in the card header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex-1 p-2.5 rounded-2xl glass-pill flex items-center justify-between gap-2.5 text-left active:scale-[0.98] transition shadow-sm border border-white/80"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {currentStudent?.photo ? (
            <img src={currentStudent.photo} alt="Avatar" className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0" />
          ) : (
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentStudent?.avatarColor || 'from-blue-600 to-indigo-600'} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm`}>
              {currentStudent?.name?.slice(0, 2) || 'ST'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-slate-900 truncate">
                {currentStudent?.name || 'Select Student'}
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                Class {currentStudent?.className}-{currentStudent?.section}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold truncate">
              Roll #{currentStudent?.rollNo} • Tap to switch candidate
            </p>
          </div>
        </div>
        <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* PORTAL TO BODY: Renders at root level so the title bar CANNOT overlap it */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Dimmed Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              {/* Frosted Bottom Sheet Drawer */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                className="relative z-10 w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-white/95 backdrop-blur-2xl p-5 shadow-2xl border border-white max-h-[85vh] flex flex-col space-y-3.5"
              >
                {/* Drag pill indicator */}
                <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-1 mb-1" />

                {/* Sheet Header */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">Select Student Candidate</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Switch documents for any of the {students.length} students</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Instant Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Type name, roll no (e.g. 102), or ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Class Filter Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
                  {['All', ...classes].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setClassFilter(c)}
                      className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition ${
                        classFilter === c
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c === 'All' ? 'All Classes' : `Class ${c}`}
                    </button>
                  ))}
                </div>

                {/* Candidate Cards List */}
                <div className="overflow-y-auto space-y-2 flex-1 pr-1 max-h-[50vh]">
                  {filteredList.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-1">
                      <p className="font-bold text-slate-600">No student found</p>
                      <p className="text-[11px]">Try typing another name or clearing the filter.</p>
                    </div>
                  ) : (
                    filteredList.map(st => {
                      const isSelected = st.id === selectedStudentId;
                      return (
                        <div
                          key={st.id}
                          onClick={() => handleSelect(st)}
                          className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between gap-3 transition ${
                            isSelected
                              ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                              : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/70'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {st.photo ? (
                              <img src={st.photo} alt={st.name} className="w-10 h-10 rounded-xl object-cover border shrink-0" />
                            ) : (
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${st.avatarColor} text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0`}>
                                {st.name.slice(0, 2)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-black text-xs text-slate-900 truncate">{st.name}</h4>
                              <p className="text-[10px] text-slate-500 font-bold truncate">
                                Class {st.className}-{st.section} • Roll #{st.rollNo} • <span className="font-mono text-slate-400">{st.id}</span>
                              </p>
                            </div>
                          </div>

                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                              : 'border-2 border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
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
