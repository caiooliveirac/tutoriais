"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TutorialStep } from './types';
import { mapTutorialFlow } from './scenarios/converter';
import { TutorialOverlay } from './TutorialOverlay';

interface TutorialContextValue {
  isActive: boolean;
  steps: TutorialStep[];
  currentStepIndex: number;
  startTutorial: (flowId: string) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TutorialContext = createContext<TutorialContextValue | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const isActive = steps.length > 0;

  const startTutorial = useCallback((flowId: string) => {
    const flowSteps = mapTutorialFlow(flowId);
    setSteps(flowSteps);
    setCurrentStepIndex(0);
  }, []);

  const stopTutorial = useCallback(() => {
    setSteps([]);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const next = prev + 1;
      if (next >= steps.length) return prev;
      return next;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (!isActive) return;
    if (currentStepIndex >= steps.length) {
      stopTutorial();
    }
  }, [currentStepIndex, isActive, steps.length, stopTutorial]);

  useEffect(() => {
    if (!isActive) return;
    const step = steps[currentStepIndex];
    if (!step || step.actionRequired !== 'click' || !step.targetElementId) return;

    let target = document.getElementById(step.targetElementId);
    let cleanup: (() => void) | undefined;

    const handler = () => {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex >= steps.length) {
        stopTutorial();
      } else {
        setCurrentStepIndex(nextIndex);
      }
    };

    if (target) {
        target.addEventListener('click', handler, { once: true });
        cleanup = () => target?.removeEventListener('click', handler);
    } else {
        // Retry logic for dynamic elements (like modals)
        const interval = setInterval(() => {
            target = document.getElementById(step.targetElementId!);
            if (target) {
                target.addEventListener('click', handler, { once: true });
                cleanup = () => target?.removeEventListener('click', handler);
                clearInterval(interval);
            }
        }, 100);
        
        // Stop checking after 5 seconds to avoid infinite loops
        const timeout = setTimeout(() => clearInterval(interval), 5000);
        
        cleanup = () => {
            clearInterval(interval);
            clearTimeout(timeout);
            if (target) target.removeEventListener('click', handler);
        };
    }

    return () => {
        if (cleanup) cleanup();
    };
  }, [currentStepIndex, isActive, steps, stopTutorial]);

  const value = useMemo(() => ({
    isActive,
    steps,
    currentStepIndex,
    startTutorial,
    stopTutorial,
    nextStep,
    prevStep
  }), [isActive, steps, currentStepIndex, startTutorial, stopTutorial, nextStep, prevStep]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialOverlay />
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) throw new Error('useTutorial must be used within TutorialProvider');
  return context;
}
