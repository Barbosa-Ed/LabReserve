import React, { useState } from 'react';
import { Lab } from '../types';

interface LabsDirectoryScreenProps {
  labs: Lab[];
  onSelectLabForReservation: (lab: Lab) => void;
  onRequestSoftwareForLab: (lab: Lab) => void;
}

export const LabsDirectoryScreen: React.FC<LabsDirectoryScreenProps> = ({
  labs,
  onSelectLabForReservation,
  onRequestSoftwareForLab,
}) => {
  const [filter, setFilter] = useState<'all' | 'livre' | 'mac' | 'gpu'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLabs = labs.filter((lab) => {
    if (filter === 'livre' && lab.status !== 'livre') return false;
    if (filter === 'mac' && !lab.name.toLowerCase().includes('mac') && !lab.code.startsWith('C3')) return false;
    if (filter === 'gpu' && !lab.gpu && !lab.name.toLowerCase().includes('gpu')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = lab.code.toLowerCase().includes(q);
      const matchName = lab.name.toLowerCase().includes(q);
      const matchBlock = lab.block.toLowerCase().includes(q);
      const matchSoftware = lab.installedSoftware.some((s) => s.toLowerCase().includes(q));
      const matchCpu = lab.cpu.toLowerCase().includes(q);
      return matchCode || matchName || matchBlock || matchSoftware || matchCpu;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Search and Filters Header */}
      <section className="px-gutter pt-4 pb-2 space-y-3">
        <div className="flex flex-col">
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Grade de Laboratórios & Salas
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Explore a infraestrutura de computadores com padrão <strong>Bloco + Número</strong> (ex: <code>C302</code>, <code>B204</code>), softwares instalados e lotação.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por código (ex: C302, B204), software (ex: VS Code, AutoCAD) ou bloco..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Todas as Salas ({labs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('livre')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'livre'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Livres Agora
          </button>
          <button
            type="button"
            onClick={() => setFilter('mac')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'mac'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Ambiente Apple Mac
          </button>
          <button
            type="button"
            onClick={() => setFilter('gpu')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'gpu'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Estações com GPU RTX
          </button>
        </div>
      </section>

      {/* Laboratories Grid - Responsive Multi-Column on Desktop */}
      <section className="px-gutter py-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLabs.length === 0 ? (
          <div className="col-span-full bg-surface-container-lowest rounded-xl p-8 text-center text-on-surface-variant flex flex-col items-center justify-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">desktop_access_disabled</span>
            <p className="font-title-md text-title-md font-semibold text-on-surface">Nenhum laboratório encontrado</p>
            <p className="font-body-sm text-body-sm mt-1">Tente remover o filtro de pesquisa ou selecionar outra categoria.</p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold cursor-pointer"
              type="button"
            >
              Ver todos os laboratórios
            </button>
          </div>
        ) : (
          filteredLabs.map((lab) => (
            <article
              key={lab.id}
              className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between gap-3 hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-2.5">
                {/* Header with Standard Room Code */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center font-bold font-mono shadow-sm shrink-0">
                      <span className="text-base leading-none font-black">{lab.code}</span>
                      <span className="text-[9px] uppercase opacity-80 mt-0.5">{lab.block}</span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          lab.status === 'livre'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          {lab.status === 'livre' ? 'Livre' : 'Reservada'}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          {lab.floor} (Sala {lab.roomNumber})
                        </span>
                      </div>
                      <h3 className="font-title-md text-title-md text-on-surface font-bold leading-tight">
                        {lab.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Hardware Specs Grid */}
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Capacidade</span>
                    <span className="font-title-md text-title-md text-primary font-black">
                      {lab.capacity} Estações
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Configuração</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">
                      {lab.cpu}
                    </span>
                    <span className="text-xs text-on-surface-variant truncate">
                      {lab.ram} • {lab.storage}
                    </span>
                  </div>
                </div>

                {/* GPU callout if exists */}
                {lab.gpu && (
                  <div className="flex items-center gap-1.5 bg-primary-fixed/30 text-on-primary-fixed px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[16px]">speed</span>
                    <span>Placa Gráfica: {lab.gpu}</span>
                  </div>
                )}

                {/* Softwares */}
                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Softwares Homologados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.installedSoftware.map((soft) => (
                      <span
                        key={soft}
                        className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium"
                      >
                        {soft}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => onRequestSoftwareForLab(lab)}
                  className="h-10 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">build</span>
                  Pedir Soft
                </button>
                <button
                  type="button"
                  onClick={() => onSelectLabForReservation(lab)}
                  className="h-10 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1 hover:bg-primary active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Pedir Reserva
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};
