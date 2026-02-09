import React from 'react';
import { Phone, Clock, Mail, User, SlidersHorizontal, LogOut, BookOpen, GraduationCap } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
  onGenerateOccurrence?: () => void;
  onOpenUnlocker: () => void;
  onToggleTutorials: () => void;
}

export function Header({ onOpenHelp, onGenerateOccurrence, onOpenUnlocker, onToggleTutorials }: HeaderProps) {
  return (
    <header className="bg-white h-[60px] border-b border-orange-200 px-6 flex items-center justify-between shrink-0 shadow-sm relative z-20">
      <div className="flex items-center gap-1">
        <div className="bg-emerald-600 text-white font-black italic text-xl px-1 rounded-sm shadow-sm transform -skew-x-12">MED</div>
        <div className="text-emerald-600 text-xl font-bold">+</div>
        <div className="text-slate-800 font-bold text-lg tracking-wider">SIMULADOR</div>
        <div className="text-[10px] text-slate-400 border-l border-slate-300 ml-3 pl-3 leading-tight">
          8/2/2026 14:20:45
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">
          Bem Vindo: <span className="text-slate-700">USUÁRIO TREINAMENTO</span>
        </span>

        <button 
          onClick={onToggleTutorials}
          className="bg-blue-600 hover:bg-blue-700 text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 font-bold text-xs uppercase px-4 py-2 rounded shadow-md transition-all flex items-center gap-2"
        >
          <GraduationCap size={16} />
          Tutoriais
        </button>

        <button 
          onClick={onGenerateOccurrence}
          className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 font-bold text-xs uppercase px-5 py-2 rounded shadow-md transition-all flex items-center gap-2"
        >
          Gerar Ocorrência
        </button>

        {/* Utility Icons Row */}
        <div className="flex items-center gap-1 ml-2">
          {/* 1. Phone List (Purple) */}
          <div className="w-8 h-8 bg-indigo-900 rounded flex items-center justify-center text-white cursor-pointer hover:bg-indigo-800 shadow-sm border border-indigo-950/50">
             <Phone size={14} />
          </div>
          
          {/* 2. Clock (Teal/Green) */}
          <div className="w-8 h-8 bg-teal-700 rounded flex items-center justify-center text-white cursor-pointer hover:bg-teal-600 shadow-sm border border-teal-800/50">
             <Clock size={14} />
          </div>
          
          {/* 3. CENTER ADMIN UNLOCKER (Dark/Black) */}
          <div 
             onClick={onOpenUnlocker}
             title="Painel de Controle / Desbloqueio"
             className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white cursor-pointer hover:bg-black shadow-sm border border-slate-700 ring-2 ring-transparent hover:ring-slate-500 transition-all"
          >
             <SlidersHorizontal size={14} />
          </div>
          
          {/* 4. User (Cyan/Blue) */}
          <div className="w-8 h-8 bg-cyan-100 rounded flex items-center justify-center text-cyan-600 cursor-pointer hover:bg-cyan-200 shadow-sm border border-cyan-200">
             <User size={14} />
          </div>
          
          {/* 5. Mail (Yellow) */}
          <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-yellow-900 cursor-pointer hover:bg-yellow-500 shadow-sm border border-yellow-500">
             <Mail size={14} />
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        
        {/* HELP BUTTON */}
        <button 
          onClick={onOpenHelp}
          title="Manual de Procedimentos"
          className="w-8 h-8 border border-orange-200 bg-orange-50 text-orange-600 rounded flex items-center justify-center hover:bg-orange-100 transition-colors"
        >
          <BookOpen size={16} />
        </button>

        <button className="bg-slate-200 p-2 rounded hover:bg-slate-300 text-slate-600" title="Sair do Sistema">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
