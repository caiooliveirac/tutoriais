import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, className, showCloseButton = true }: ModalProps) {
  if (!isOpen) return null;

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
    >
      <div className={clsx("bg-white rounded shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 relative z-[310]", className)}>
        {(title || showCloseButton) && (
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
                {title ? <h3 className="font-bold text-slate-800 text-lg">{title}</h3> : <div />}
                {showCloseButton && (
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors">
                        <X size={24} />
                    </button>
                )}
            </div>
        )}
        <div className="p-0">
          {children}
        </div>
      </div>
    </div>
  );
}
