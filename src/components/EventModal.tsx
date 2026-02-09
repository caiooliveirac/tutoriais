import React from 'react';
import { X, AlertTriangle, UserX, Truck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    type: 'evasion' | 'refusal' | 'mechanical_failure' | 'worsening' | 'qta';
    title: string;
    message: string;
  } | undefined;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  const getIcon = () => {
    switch (event.type) {
      case 'evasion': return <UserX size={48} className="text-amber-500" />;
      case 'refusal': return <UserX size={48} className="text-red-500" />;
      case 'mechanical_failure': return <Truck size={48} className="text-slate-600" />;
      case 'worsening': return <Activity size={48} className="text-red-600" />;
      case 'qta': return <AlertTriangle size={48} className="text-red-500" />;
      default: return <AlertTriangle size={48} className="text-blue-500" />;
    }
  };

  const getColorClass = () => {
      switch (event.type) {
          case 'evasion': return 'border-l-amber-500';
          case 'refusal': return 'border-l-red-500';
          case 'mechanical_failure': return 'border-l-slate-600';
          case 'worsening': return 'border-l-red-600';
          case 'qta': return 'border-l-red-500';
          default: return 'border-l-blue-500';
      }
  };

  return (
    <AnimatePresence>
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className={`bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border-l-8 ${getColorClass()}`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 rounded-full">
                            {getIcon()}
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{event.title}</h2>
                    <p className="text-slate-600 leading-relaxed text-base">
                        {event.message}
                    </p>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="bg-slate-900 hover:bg-black text-white px-6 py-2 rounded font-medium shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wide"
                        >
                            Ciente
                        </button>
                    </div>
                </div>
                <div className="h-1 bg-slate-100"></div>
            </motion.div>
        </div>
    </AnimatePresence>
  );
};
