import React from 'react';
import { scenarios } from '../scenarios';
import { Scenario } from '../types/scenarios';
import { Play } from 'lucide-react';

interface TutorialMenuProps {
  onSelectScenario: (scenario: Scenario) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialMenu: React.FC<TutorialMenuProps> = ({ onSelectScenario, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-6 w-80 bg-white shadow-xl border border-slate-200 rounded-md z-50 overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-sm">Treinamento e Simulação</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto">
            {scenarios.map((scenario) => (
                <button
                    key={scenario.id}
                    onClick={() => {
                        onSelectScenario(scenario);
                        onClose();
                    }}
                    className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-blue-50 transition-colors group"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-700 text-xs group-hover:text-blue-700">{scenario.title}</span>
                        <Play size={12} className="text-slate-300 group-hover:text-blue-500" />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{scenario.description}</p>
                </button>
            ))}
        </div>
    </div>
  );
};
