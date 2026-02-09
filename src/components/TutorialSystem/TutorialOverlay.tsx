"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Brain, MousePointer2 } from 'lucide-react';
import { useTutorial } from './TutorialContext';
import { TutorialStep } from './types';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTargetRect(step?: TutorialStep): TargetRect | null {
  if (!step?.targetElementId) return null;
  const el = document.getElementById(step.targetElementId);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
}

export function TutorialOverlay() {
  const { isActive, steps, currentStepIndex, stopTutorial, nextStep, prevStep } = useTutorial();
  const step = steps[currentStepIndex];
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardSize, setCardSize] = useState({ width: 320, height: 220 });

  useEffect(() => {
    if (!isActive) return;
    const update = () => setTargetRect(getTargetRect(step));
    update();
    
    // Retry finding element (e.g. waiting for modal animation)
    const interval = setInterval(update, 100);
    const timeout = setTimeout(() => clearInterval(interval), 3000);

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isActive, step]);

  useEffect(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.width && rect.height) {
      setCardSize({ width: rect.width, height: rect.height });
    }
  }, [step]);

  const spotlightStyle = useMemo(() => {
    if (!targetRect) return null;
    const padding = 8;
    return {
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2
    };
  }, [targetRect]);

  const cardPosition = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    const margin = 12;

    if (!targetRect || !step) {
      const top = Math.max(margin, (vh - cardSize.height) / 2);
      const left = Math.max(margin, (vw - cardSize.width) / 2);
      return { top, left };
    }

    const offset = 16;
    let top = targetRect.top;
    let left = targetRect.left;

    switch (step.position) {
      case 'top':
        top = targetRect.top - offset - cardSize.height;
        left = targetRect.left + targetRect.width / 2 - cardSize.width / 2;
        break;
      case 'bottom':
        top = targetRect.top + targetRect.height + offset;
        left = targetRect.left + targetRect.width / 2 - cardSize.width / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - cardSize.height / 2;
        left = targetRect.left - offset - cardSize.width;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - cardSize.height / 2;
        left = targetRect.left + targetRect.width + offset;
        break;
      default:
        top = (vh - cardSize.height) / 2;
        left = (vw - cardSize.width) / 2;
    }

    const maxLeft = Math.max(margin, vw - cardSize.width - margin);
    const maxTop = Math.max(margin, vh - cardSize.height - margin);

    return {
      top: Math.min(Math.max(top, margin), maxTop),
      left: Math.min(Math.max(left, margin), maxLeft)
    };
  }, [targetRect, step, cardSize]);

  if (!isActive || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[400] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {!step.disableBackdrop && <div className="absolute inset-0 bg-black/50" style={{ zIndex: 205 }} />}

        {spotlightStyle && !step.disableBackdrop && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            animate={spotlightStyle}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              zIndex: 205, // Ensure spotlight hole is above backdrop
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              borderRadius: '9999px',
              outline: step.actionRequired === 'click' ? '2px solid rgba(59,130,246,0.9)' : 'none'
            }}
          />
        )}

        <motion.div
          ref={cardRef}
          className="absolute z-[210] w-[320px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          style={cardPosition}
        >
          <div className={`px-4 py-3 border-b border-slate-200 flex items-center justify-between ${step.stepType === 'behavioral' ? 'bg-purple-50' : 'bg-blue-50'}`}>
            <div className={`text-[10px] font-bold uppercase flex items-center gap-2 ${step.stepType === 'behavioral' ? 'text-purple-700' : 'text-blue-700'}`}>
               {step.stepType === 'behavioral' ? <Brain size={14} /> : <MousePointer2 size={14} />}
               {step.stepType === 'behavioral' ? 'Dica de Comportamento' : 'Instrutor Digital'}
            </div>
            <button onClick={stopTutorial} className="p-1 hover:bg-slate-200 rounded text-slate-500">
              <X size={14} />
            </button>
          </div>
          <div className="p-4 text-sm text-slate-700 leading-relaxed">
            {step.text}
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={prevStep}
              className="text-[11px] text-slate-500 hover:text-slate-700 font-bold"
              disabled={currentStepIndex === 0}
            >
              Voltar
            </button>
            {step.actionRequired === 'next' ? (
              <button
                onClick={() => {
                  if (currentStepIndex >= steps.length - 1) {
                    stopTutorial();
                  } else {
                    nextStep();
                  }
                }}
                className="text-[11px] text-white bg-blue-600 hover:bg-blue-700 font-bold px-3 py-1.5 rounded"
              >
                Continuar
              </button>
            ) : (
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wide animate-pulse">Clique no item destacado</span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
