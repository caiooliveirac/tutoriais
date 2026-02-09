"use client";

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { OccurrenceTable } from '../components/OccurrenceTable';
import { TriagemRow } from '../components/TriagemRow';
import { RegulacaoRow } from '../components/RegulacaoRow';
import { SimulationControls } from '../components/SimulationControls';
import { HelpDrawer } from '../components/HelpDrawer';
import { UnlockModal } from '../components/UnlockModal';
import { TutorialMenu } from '../components/TutorialMenu';
import { OccurrenceDetailContainer } from '../components/OccurrenceDetail/OccurrenceDetailContainer';
import { TriagemDetailContainer } from '../components/TriagemDetail/TriagemDetailContainer';
import { TutorialProvider } from '../components/TutorialSystem/TutorialContext';
import { Scenario, SimulationActions } from '../types/scenarios';
import { useSamuSimulation } from '../hooks/useSamuSimulation';
import { RegulacaoData, TriagemData } from '../types';

export default function Home() {
  const { 
    triagemData, 
    regulacaoData, 
    addOccurrence, 
    lockRandomOccurrence,
    triggerEvasion, 
    triggerQTA,
    findHospital,
    getLockedOccurrences,
    unlockOccurrence,
    updateOccurrence,
    updateTriagemOccurrence,
    removeTriagemOccurrence,
    removeOccurrence,
    triggerRefusal,
    triggerMechanicalFailure,
    triggerWorsening,
    clearActiveEvent,
    releaseUnit
  } = useSamuSimulation();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isUnlockerOpen, setIsUnlockerOpen] = useState(false);
  const [isTutorialMenuOpen, setIsTutorialMenuOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<RegulacaoData | null>(null);
  const [selectedTriagem, setSelectedTriagem] = useState<TriagemData | null>(null);

  const handleSelectScenario = (scenario: Scenario) => {
      setActiveScenario(scenario);
      if (scenario.setup) {
          const actions: SimulationActions = {
              addOccurrence,
              lockRandomOccurrence,
              triggerEvasion,
              triggerQTA,
              findHospital,
              unlockOccurrence,
              triggerRefusal,
              triggerMechanicalFailure,
              triggerWorsening
          };
          scenario.setup(actions);
      }
  };

  // Column definitions matching the grid layout in rows
  const triagemHeaders = [
    { label: 'Protocolo' },
    { label: 'Status', className: 'text-center' },
    { label: 'Data' },
    { label: 'Telefone' },
    { label: 'Médico' },
    { label: 'Tarm' },
    { label: 'Cidade' },
    { label: 'Bairro' },
    { label: 'Solicitante' },
     { label: 'Queixa', id: 'col-queixa' },
    { label: 'Tipo Unidade' },
    { label: 'Risco', className: 'text-center' },
    { label: 'Status da Ocorrência', className: 'text-right' }
  ];

  const regulacaoHeaders = [
    { label: 'Protocolo' },
    { label: 'Status', className: 'text-center' },
    { label: 'Data' },
    { label: 'Cidade' },
    { label: 'Bairro' },
    { label: 'Médico' },
    { label: 'Queixa' },
    { label: 'Equipe', className: 'text-right pr-6' },
    { label: 'Risco', className: 'text-center' },
    { label: 'Status da Ocorrência', className: 'text-right pr-2' }
  ];

  const handleUpdateOccurrence = (id: string, updates: Partial<RegulacaoData>) => {
      updateOccurrence(id, updates);
      if (selectedOccurrence && selectedOccurrence.id === id) {
          setSelectedOccurrence(prev => prev ? ({ ...prev, ...updates }) : null);
      }
  };

    const handleUpdateTriagem = (id: string, updates: Partial<TriagemData>) => {
      updateTriagemOccurrence(id, updates);
      if (selectedTriagem && selectedTriagem.id === id) {
        setSelectedTriagem(prev => prev ? ({ ...prev, ...updates }) : null);
      }
    };

      const handleRemoveTriagem = (id: string) => {
        removeTriagemOccurrence(id);
        if (selectedTriagem && selectedTriagem.id === id) {
          setSelectedTriagem(null);
        }
      };

  const handleRemoveOccurrence = (id: string) => {
      removeOccurrence(id);
      if (selectedOccurrence && selectedOccurrence.id === id) {
          setSelectedOccurrence(null);
      }
  };

  /* --- FULL SCREEN DETAIL MODE --- */
    if (selectedTriagem) {
        return (
          <TutorialProvider>
            <div className="h-screen w-screen overflow-hidden bg-slate-100">
                <TriagemDetailContainer 
                    data={selectedTriagem}
                    onClose={() => setSelectedTriagem(null)}
                    onUpdateTriagem={handleUpdateTriagem}
                    onRemoveTriagem={handleRemoveTriagem}
                />
            </div>
          </TutorialProvider>
        );
    }

    if (selectedOccurrence) {
        return (
          <TutorialProvider>
            <div className="h-screen w-screen overflow-hidden bg-slate-100">
                <OccurrenceDetailContainer 
                    viewMode="ACTION"
                    data={selectedOccurrence}
                    onClose={() => setSelectedOccurrence(null)}
                    onReleaseUnit={releaseUnit}
                    onUpdateOccurrence={handleUpdateOccurrence}
                    onRemoveOccurrence={handleRemoveOccurrence}
                />
            </div>
          </TutorialProvider>
        );
    }

  return (
    <TutorialProvider>
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      
      <Header 
        onOpenHelp={() => setIsHelpOpen(true)} 
        onGenerateOccurrence={addOccurrence} 
        onOpenUnlocker={() => setIsUnlockerOpen(true)}
        onToggleTutorials={() => setIsTutorialMenuOpen(!isTutorialMenuOpen)}
      />
      
      {/* Tutorial Menu Overlay */}
      <TutorialMenu 
         isOpen={isTutorialMenuOpen}
         onClose={() => setIsTutorialMenuOpen(false)}
         onSelectScenario={handleSelectScenario}
      />

      {/* TOP TABS */}
      <div className="px-6 py-4 bg-slate-50 flex items-end gap-1 border-b border-slate-200 shrink-0">
           <div className="bg-white border-t-2 border-l border-r border-slate-200 rounded-t px-6 py-2 text-blue-600 text-xs font-bold shadow-sm relative -mb-[17px] z-10 pb-4">
               Minhas Ocorrências
           </div>
           <div className="text-slate-500 hover:text-slate-700 text-xs font-bold px-4 py-2 cursor-pointer pb-4">
               Todas
           </div>
           <div className="text-slate-500 hover:text-slate-700 text-xs font-bold px-4 py-2 cursor-pointer pb-4">
               Vermelhas
           </div>
      </div>

      <main className="flex-1 overflow-auto p-4 space-y-6 bg-slate-50 pb-24">
           
           {/* TABLE 1: TRIAGEM */}
           <OccurrenceTable 
              title="TRIAGEM"
              headers={triagemHeaders}
              gridColsClass="grid-cols-[110px_50px_80px_90px_1fr_1fr_1fr_1fr_1fr_2fr_1fr_50px_140px]"
           >
              {triagemData.map((row, index) => (
                  <TriagemRow 
                    key={row.id} 
                    data={row} 
                    index={index}
                    onOpenDetail={(item) => {
                      if (!item.isLocked) {
                        setSelectedTriagem(item);
                      }
                    }}
                  />
              ))}
           </OccurrenceTable>


           {/* TABLE 2: REGULACAO */}
           <OccurrenceTable 
              title="REGULAÇÃO"
              headers={regulacaoHeaders}
              gridColsClass="grid-cols-[100px_40px_80px_1fr_1fr_1fr_2fr_170px_50px_160px]"
           >
              {regulacaoData.map((row) => (
                  <RegulacaoRow 
                      key={row.id} 
                      data={row} 
                      onClearEvent={clearActiveEvent} 
                      onOpenDetail={setSelectedOccurrence}
                  />
              ))}
           </OccurrenceTable>

      </main>
      
      {/* COMPONENTS OVERLAYS */}
          
      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      <UnlockModal 
        isOpen={isUnlockerOpen} 
        onClose={() => setIsUnlockerOpen(false)} 
        lockedItems={getLockedOccurrences()}
        onUnlock={unlockOccurrence}
      />
      
      <SimulationControls 
         onAddOccurrence={addOccurrence}
         onLockOccurrence={lockRandomOccurrence}
         onEvasion={triggerEvasion}
         onQTA={triggerQTA}
         onHospitalFound={findHospital}
      />

    </div>
    </TutorialProvider>
  );
}
