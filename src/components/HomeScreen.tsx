import React from 'react';
import { Reservation, User } from '../types';
import { downloadReservationJpg, shareReservationJpg } from '../utils/cardGenerator';

interface HomeScreenProps {
  currentUser: User;
  reservations: Reservation[];
  onStartReservation: () => void;
  onOpenSoftwareRequest: () => void;
  onViewReservationTicket: (reservation: Reservation) => void;
  onViewAllHistory: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  reservations,
  onStartReservation,
  onOpenSoftwareRequest,
  onViewReservationTicket,
  onViewAllHistory,
}) => {
  // Count metrics for THIS professor's reservations
  const activeCount = reservations.filter((r) => r.status === 'confirmada').length;
  const pendingCount = reservations.filter((r) => r.status === 'pendente' || r.status === 'aguardando_ti').length;

  // Next class spotlight: first confirmed reservation
  const nextClass = reservations.find((r) => r.status === 'confirmada') || reservations[0];

  // Upcoming items
  const upcomingList = reservations.filter((r) => r.id !== nextClass?.id).slice(0, 4);

  return (
    <div className="flex flex-col w-full pb-8 space-y-4">
      {/* Top Greeting & Department Context */}
      <section className="px-gutter pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Olá, {currentUser.name}
              </h1>
              <span className="text-xl animate-bounce">👋</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-primary">school</span>
              {currentUser.department || 'Corpo Docente'} • {currentUser.institute || 'Universidade'}
            </p>
          </div>
          <button
            onClick={onViewAllHistory}
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shadow-sm relative active:scale-95 transition-transform cursor-pointer"
            aria-label="Ver agenda"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary"></span>
          </button>
        </div>
      </section>

      {/* Metric Counters Bento Strip */}
      <section className="px-gutter">
        <div className="grid grid-cols-3 gap-3">
          {/* Card 1: Reservas Ativas */}
          <div
            onClick={onViewAllHistory}
            className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98] border border-outline-variant/20"
          >
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-primary/5 rounded-full pointer-events-none"></div>
            <span className="material-symbols-outlined text-primary text-[24px]">event_available</span>
            <div className="mt-3">
              <span className="font-headline-lg text-headline-lg text-on-surface block leading-tight font-black">
                {activeCount}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant line-clamp-1 font-semibold">
                Reservas Ativas
              </span>
            </div>
          </div>

          {/* Card 2: Pendente / Análise */}
          <div
            onClick={onViewAllHistory}
            className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98] border border-outline-variant/20"
          >
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-tertiary-fixed/30 rounded-full pointer-events-none"></div>
            <span className="material-symbols-outlined text-tertiary-container text-[24px]">pending_actions</span>
            <div className="mt-3">
              <span className="font-headline-lg text-headline-lg text-on-surface block leading-tight font-black">
                {pendingCount}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant line-clamp-1 font-semibold">
                Em Análise
              </span>
            </div>
          </div>

          {/* Card 3: Taxa de Aprov. */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden border border-outline-variant/20">
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-secondary-container/40 rounded-full pointer-events-none"></div>
            <span className="material-symbols-outlined text-secondary text-[24px]">verified</span>
            <div className="mt-3">
              <span className="font-headline-lg text-headline-lg text-secondary block leading-tight font-black">
                98%
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant line-clamp-1 font-semibold">
                Taxa de Aprov.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Responsive 2-Column Split: Spotlight on Left, Quick Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-gutter">
        {/* Next Class Spotlight Hero Card */}
        {nextClass && (
          <section className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-secondary animate-pulse"></span>
                <h2 className="font-title-md text-title-md text-on-surface font-bold">
                  Próxima Aula Agendada
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold bg-primary-fixed/40 px-2.5 py-0.5 rounded-full">
                {nextClass.dateFormatted}
              </span>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-md flex flex-col justify-between flex-1 gap-4 relative overflow-hidden border border-outline-variant/30">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary-fixed/25 rounded-full pointer-events-none blur-2xl"></div>

              {/* Time, Room standard Code, and Status Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-bold">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="font-label-md text-label-md">
                      {nextClass.startTime} - {nextClass.endTime}
                    </span>
                  </div>

                  {nextClass.assignedLabCode && (
                    <span className="bg-primary text-on-primary px-3 py-1 rounded-full font-mono font-black text-sm shadow-sm">
                      SALA {nextClass.assignedLabCode}
                    </span>
                  )}
                </div>

                <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                  nextClass.status === 'confirmada'
                    ? 'bg-secondary-container/70 text-on-secondary-container'
                    : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  {nextClass.status === 'confirmada' ? 'Alocada' : 'Em Análise'}
                </span>
              </div>

              {/* Class & Lab Metadata */}
              <div className="relative z-10">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                  {nextClass.subject}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[18px] text-primary">meeting_room</span>
                  <span>{nextClass.assignedLabName || 'Sala Pendente'}</span>
                  <span className="text-outline-variant">•</span>
                  <span>{nextClass.assignedLocation || 'Aguardando DTI'}</span>
                </p>
              </div>

              {/* Capacity & Tech Stack Pills */}
              <div className="flex flex-wrap items-center gap-2 relative z-10">
                <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-bold">
                  <span className="material-symbols-outlined text-[14px]">groups</span>
                  {nextClass.studentsCount} Alunos
                </span>
                <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-medium">
                  <span className="material-symbols-outlined text-[14px]">code</span>
                  {nextClass.requiredSoftware.slice(0, 3).join(' • ')}
                </span>
              </div>

              {/* Action Buttons: Download .JPG Card / View Ticket (Removed Digital Key button) */}
              <div className="pt-2 relative z-10 border-t border-outline-variant/15">
                {nextClass.status === 'confirmada' ? (
                  <button
                    className="w-full bg-primary hover:bg-on-primary-fixed-variant active:scale-[0.99] transition-all text-on-primary h-12 rounded-xl flex items-center justify-center gap-2 font-label-md text-label-md font-bold shadow-sm cursor-pointer"
                    onClick={() => downloadReservationJpg(nextClass)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">image</span>
                    Baixar Card .JPG da Sala
                  </button>
                ) : (
                  <button
                    className="w-full bg-surface-container text-on-surface-variant h-12 rounded-xl flex items-center justify-center gap-2 font-label-md text-label-md font-semibold cursor-pointer"
                    onClick={() => onViewReservationTicket(nextClass)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                    Ver Status do Pedido
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions Grid */}
        <section className="lg:col-span-5 flex flex-col justify-between">
          <h2 className="font-title-md text-title-md text-on-surface mb-2 font-bold">
            Ações Rápidas
          </h2>
          <div className="flex flex-col gap-2.5 flex-1 justify-between">
            {/* Main Primary Action: Fazer Pedido de Sala */}
            <button
              onClick={onStartReservation}
              className="w-full bg-primary-container hover:bg-primary text-on-primary p-4 rounded-2xl flex items-center justify-between shadow-sm active:scale-[0.99] transition-all cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-surface-container-lowest/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[26px]">add_circle</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label-lg text-label-lg leading-tight font-bold">
                    Fazer Pedido de Sala
                  </span>
                  <span className="font-label-sm text-label-sm text-on-primary-container mt-0.5">
                    Envie os requisitos da aula para alocação
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
            </button>

            {/* Pedir Instalação de Software (Sem sala específica) */}
            <button
              onClick={onOpenSoftwareRequest}
              className="bg-surface-container-lowest text-on-surface p-4 rounded-2xl flex items-center justify-between shadow-sm hover:bg-surface-container-low transition-colors cursor-pointer border border-outline-variant/20"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-tertiary-container/15 text-tertiary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">build</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label-lg text-label-lg leading-tight font-bold">
                    Pedir Instalação de Software
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                    Solicite pacotes técnicos ou atualizações ao DTI
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-outline">arrow_forward</span>
            </button>
          </div>
        </section>
      </div>

      {/* Upcoming Reservations List */}
      <section className="px-gutter pt-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-title-md text-title-md text-on-surface font-bold">
            Suas Próximas Aulas & Reservas
          </h2>
          <button
            onClick={onViewAllHistory}
            className="font-label-sm text-label-sm text-primary font-bold hover:underline cursor-pointer"
            type="button"
          >
            Ver todas ({reservations.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingList.map((res) => (
            <div
              key={res.id}
              className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-2.5 border border-outline-variant/20 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">
                    {res.subject}
                  </h4>
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-outline">meeting_room</span>
                    {res.assignedLabCode ? (
                      <strong className="text-primary font-mono">Sala {res.assignedLabCode}</strong>
                    ) : (
                      'Pendente de Alocação'
                    )}
                    {res.assignedLocation && ` • ${res.assignedLocation}`}
                  </span>
                </div>

                {res.status === 'confirmada' ? (
                  <span className="inline-flex items-center gap-1 bg-secondary-container/60 text-on-secondary-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Confirmada
                  </span>
                ) : res.status === 'pendente' ? (
                  <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                    Pendente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
                    Rejeitada
                  </span>
                )}
              </div>

              {/* Justification if rejected */}
              {res.status === 'rejeitada' && res.adminJustification && (
                <div className="bg-error-container/30 p-2.5 rounded-xl text-xs text-on-surface">
                  <strong>Motivo:</strong> {res.adminJustification}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-on-surface-variant border-t border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-md font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                    {res.dateFormatted.split(',')[0]}
                  </div>
                  <span className="font-label-sm text-label-sm font-medium">
                    {res.startTime} - {res.endTime}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {res.status === 'confirmada' && (
                    <button
                      onClick={() => downloadReservationJpg(res)}
                      title="Baixar Card .JPG"
                      className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary-fixed transition-colors cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[17px]">image</span>
                    </button>
                  )}

                  <button
                    aria-label="Ver Comprovante"
                    onClick={() => onViewReservationTicket(res)}
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer active:scale-95"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
