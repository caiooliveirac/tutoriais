"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Phone, FileText, AlertTriangle, CheckCircle2, Ambulance } from 'lucide-react';

interface CallDetailsModalProps {
  call: any;
  onClose: () => void;
  onDispatch: () => void;
}

export default function CallDetailsModal({ call, onClose, onDispatch }: CallDetailsModalProps) {
  if (!call) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div
        id="call-detail-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden z-10 font-sans"
      >
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-start border-b 
          ${call.priority === 'high' ? 'bg-red-50 border-red-100' : 
            call.priority === 'medium' ? 'bg-yellow-50 border-yellow-100' : 'bg-blue-50 border-blue-100'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border
                 ${call.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' : 
                   call.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                 Código {call.priority === 'high' ? 'Vermelho' : call.priority === 'medium' ? 'Amarelo' : 'Verde'}
               </span>
               <span className="text-xs text-slate-500 font-mono">ID: #{call.id}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{call.type}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
           
           {/* Info Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <Clock size={14} /> Tempo Decorrido
                 </div>
                 <p className="font-medium text-slate-700">{call.time} sem resposta</p>
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <Phone size={14} /> Solicitante
                 </div>
                 <p className="font-medium text-slate-700">Anônimo (Via 192)</p>
              </div>
           </div>

           <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
               <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <MapPin size={14} /> Localização
               </div>
               <p className="font-medium text-slate-800">{call.location}</p>
               <p className="text-xs text-slate-500">Próximo ao ponto de referência informado.</p>
           </div>

           <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <FileText size={14} /> Histórico / Queixa
              </div>
              <p className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-200 p-3 rounded shadow-sm">
                Solicitante informa colisão entre motocicleta e automóvel. Vítima (motociclista) ao solo, consciente porém confusa. Relata dor intensa em MMII. Não há vazamento de combustível visível.
              </p>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
             Cancelar
           </button>
           <button 
             id="call-dispatch-btn"
             onClick={onDispatch}
             className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm shadow-blue-200 transition-all transform active:scale-95"
           >
             <Ambulance size={18} />
             Despachar Unidade
           </button>
        </div>

      </motion.div>
    </div>
  );
}
