"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, BookOpen, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Protocol } from '../data/protocols';

interface ProtocolCardProps {
  protocol: Protocol;
}

export default function ProtocolCard({ protocol }: ProtocolCardProps) {
  return (
    <div className="h-full flex items-center justify-center p-8 bg-slate-50/50">
      <motion.div
        key={protocol.id}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
      >
        {/* Header Strip */}
        <div className={`h-2 w-full ${
            protocol.category === 'Fluxo Padrão' ? 'bg-blue-500' :
            protocol.category === 'Intercorrências' ? 'bg-amber-500' : 'bg-slate-600'
        }`} />

        <div className="p-8 md:p-10">
            {/* Meta Header */}
            <div className="flex items-center gap-3 mb-6">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                    ${protocol.category === 'Fluxo Padrão' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      protocol.category === 'Intercorrências' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                    {protocol.category}
                 </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                {protocol.title}
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 font-light border-l-4 border-slate-200 pl-4 py-1 italic">
                "{protocol.shortDescription}"
            </p>

            <div className="space-y-6">
                
                {/* Full Content */}
                <div>
                     <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                        <BookOpen size={18} className="text-blue-600" />
                        Diretriz
                     </h3>
                     <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {protocol.fullContent}
                     </p>
                </div>

                {/* Bullet Points */}
                {protocol.bulletPoints && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6"
                    >
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                            <CheckCircle2 size={18} className="text-green-600" />
                            Passo a Passo
                        </h3>
                        <ul className="grid gap-3">
                            {protocol.bulletPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <span className="text-slate-700">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

            </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-100 text-xs text-slate-400">
            <div className="flex items-center gap-2">
                <ShieldCheck size={14} /> Protocolo atualizado em Fev/2026
            </div>
            <span>ID: {protocol.id}</span>
        </div>

      </motion.div>
    </div>
  );
}
