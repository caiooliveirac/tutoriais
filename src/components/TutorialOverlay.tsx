"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, X as CloseIcon } from 'lucide-react';
import { TutorialStep } from '../data/tutorialSteps';

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onClose: () => void;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export default function TutorialOverlay({ steps, onComplete, onClose, currentStepIndex, onStepChange }: TutorialOverlayProps) {
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isInteractive = !!currentStep.triggerAction;
  
  // Dynamic positioning: If interactive, move to corner to not block view. If informational, center.
  const positionClasses = isInteractive 
    ? "bottom-8 right-8 w-[400px]" 
    : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl";

  return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed ${positionClasses} pointer-events-auto bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col z-[100]`}
      >
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {isInteractive ? "Sua Vez: Ação Necessária" : `Passo ${currentStepIndex + 1}/${steps.length}`}
            </span>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-red-500">
                <CloseIcon size={16} />
            </button>
        </div>
        <div className="p-6">
            <AnimatePresence mode="wait">
                <motion.div key={currentStep.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{currentStep.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{currentStep.description}</p>
                </motion.div>
            </AnimatePresence>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
             <button onClick={() => onStepChange(currentStepIndex - 1)} disabled={isFirstStep} className={`text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 ${isFirstStep ? 'opacity-0' : ''}`}>
                <ChevronLeft size={16} /> Voltar
             </button>
             {isInteractive ? (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 animate-pulse uppercase tracking-wide">
                    Realize a ação na tela <ChevronRight size={14} />
                </div>
             ) : (
                <button onClick={() => isLastStep ? onComplete() : onStepChange(currentStepIndex + 1)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-transform active:scale-95">
                  {isLastStep ? 'Concluir' : 'Continuar'} {isLastStep ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
                </button>
             )}
        </div>
         <div className="h-1 bg-slate-100 w-full mt-auto">
             <motion.div className="h-full bg-blue-500" animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }} />
        </div>
      </motion.div>
  );
}
