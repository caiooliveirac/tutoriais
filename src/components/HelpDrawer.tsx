import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { protocols } from '../data/protocols';
import { useTutorial } from './TutorialSystem/TutorialContext';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDrawer({ isOpen, onClose }: HelpDrawerProps) {
  const { startTutorial } = useTutorial();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
          >
             <div className="bg-orange-500 p-4 flex justify-between items-center text-white shrink-0">
                 <h2 className="font-bold uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={20} /> Base de Conhecimento
                 </h2>
                 <button onClick={onClose} className="hover:bg-orange-600 p-1 rounded-full"><X size={20} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                 {protocols.map((protocol) => (
                    <div key={protocol.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700 text-sm flex items-center justify-between">
                          <span>{protocol.title}</span>
                          {protocol.tutorialFlowId && (
                            <button
                              onClick={() => {
                                startTutorial(protocol.tutorialFlowId as string);
                                onClose();
                              }}
                              className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded"
                            >
                              Iniciar Tutorial
                            </button>
                          )}
                        </div>
                        <div className="p-3 text-slate-600 text-xs leading-relaxed">{protocol.fullContent}</div>
                    </div>
                 ))}
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
