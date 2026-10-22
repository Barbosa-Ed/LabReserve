import React, { useState } from 'react';
import { Reservation } from '../types';
import { downloadReservationJpg, shareReservationJpg } from '../utils/cardGenerator';

interface HistoryScreenProps {
  reservations: Reservation[];
  onViewTicket: (res: Reservation) => void;
  onOpenQrModal: (res: Reservation) => void;
  onCancelReservation: (resId: string) => void;
  onStartNewReservation: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  reservations,
  onViewTicket,
  onOpenQrModal,
  onCancelReservation,
  onStartNewReservation,
}) => {
  const [filter, setFilter] = useState<'todas' | 'confirmada' | 'pendente' | 'rejeitada'>('todas');
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = reservations.filter((r) => {
    if (filter === 'todas') return true;
    return r.status === filter;
  });

  const handleConfirmCancel = () => {
    if (reservationToCancel) {
      onCancelReservation(reservationToCancel.id);
      setReservationToCancel(null);
      setToastMessage('Reserva cancelada com sucesso.');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleDownloadCard = async (res: Reservation) => {
    try {
      await downloadReservationJpg(res);
      setToastMessage('Card .JPG baixado com sucesso!');
    } catch {
      setToastMessage('Erro ao baixar card.');
    } finally {
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleShareCard = async (res: Reservation) => {
    try {
      await shareReservationJpg(res);
      setToastMessage('Card compartilhado!');
    } catch {
      setToastMessage('Link pronto.');
    } finally {
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <section className="px-gutter pt-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Histórico de Solicitações & Reservas
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Acompanhe o parecer do DTI, baixe o Card .JPG da sala ou acesse a chave digital.
            </p>
          </div>
          <button
            onClick={onStartNewReservation}
            className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Nova Solicitação"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">add</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('todas')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'todas'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Todas ({reservations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('confirmada')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'confirmada'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Aprovadas ({reservations.filter((r) => r.status === 'confirmada').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pendente')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'pendente'
                ? 'bg-tertiary-container text-on-tertiary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Em Análise ({reservations.filter((r) => r.status === 'pendente' || r.status === 'aguardando_ti').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('rejeitada')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'rejeitada'
                ? 'bg-error text-on-error shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Rejeitadas ({reservations.filter((r) => r.status === 'rejeitada').length})
          </button>
        </div>
      </section>

      {/* Reservation Cards Grid (Responsive 2-column on desktop) */}
      <section className="px-gutter py-2 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-surface-container-lowest rounded-xl p-8 text-center text-on-surface-variant flex flex-col items-center justify-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">event_busy</span>
            <p className="font-title-md text-title-md font-semibold text-on-surface">Nenhum registro nesta categoria</p>
            <p className="font-body-sm text-body-sm mt-1">Você não possui solicitações ou agendamentos com este status.</p>
            <button
              onClick={onStartNewReservation}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold active:scale-95 transition-transform"
              type="button"
            >
              Criar Nova Solicitação
            </button>
          </div>
        ) : (
          filtered.map((res) => {
            const isConfirmed = res.status === 'confirmada';
            const isPending = res.status === 'pendente' || res.status === 'aguardando_ti';
            const isRejected = res.status === 'rejeitada';

            return (
              <article
                key={res.id}
                className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between gap-3 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-title-md text-on-surface font-bold">
                          {res.subject}
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-mono font-bold mt-0.5">
                        {res.protocol}
                      </span>
                    </div>

                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1 bg-secondary-container/60 text-on-secondary-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Aprovada ({res.assignedLabCode || 'Sala'})
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                        Em Análise
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
                        <span className="material-symbols-outlined text-[13px]">cancel</span>
                        Rejeitada
                      </span>
                    )}
                  </div>

                  {/* Room & Time info */}
                  <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-xl text-body-sm">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                        Sala Alocada (Padrão Bloco+Nº)
                      </span>
                      <span className="font-label-md text-label-md text-primary font-black truncate">
                        {res.assignedLabCode ? `Sala ${res.assignedLabCode}` : 'A definir pelo Admin'}
                      </span>
                      <span className="text-xs text-on-surface-variant">{res.assignedLocation || 'Aguardando parecer'}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                        Data, Horário & Turma
                      </span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {res.startTime} às {res.endTime}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {res.studentsCount} Alunos • {res.dateFormatted.split(',')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Rejection Justification Notice */}
                  {isRejected && res.adminJustification && (
                    <div className="bg-error-container/40 p-3 rounded-xl border border-error/20 flex flex-col gap-1 text-xs">
                      <span className="font-bold text-error flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">report</span>
                        Motivo da Rejeição:
                      </span>
                      <p className="text-on-surface font-medium leading-relaxed">
                        {res.adminJustification}
                      </p>
                    </div>
                  )}

                  {/* Software tags */}
                  {res.requiredSoftware.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[11px] text-on-surface-variant font-semibold">Softwares:</span>
                      {res.requiredSoftware.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-surface-container text-xs text-on-surface">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/15">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewTicket(res)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-bold flex items-center gap-1 hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      {isConfirmed ? 'Comprovante' : 'Detalhes'}
                    </button>

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleDownloadCard(res)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1 hover:bg-primary-container transition-colors cursor-pointer shadow-sm"
                        title="Baixar Card .JPG com Horário e Sala"
                      >
                        <span className="material-symbols-outlined text-[16px]">image</span>
                        Card .JPG
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setReservationToCancel(res)}
                    className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-full"
                    title="Excluir / Cancelar"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Confirmation Modal for Cancellation */}
      {reservationToCancel && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setReservationToCancel(null)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">cancel</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Cancelar Pedido?
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 mb-4">
              Deseja realmente cancelar a solicitação de <strong>{reservationToCancel.subject}</strong> ({reservationToCancel.protocol})?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReservationToCancel(null)}
                className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 h-11 rounded-xl bg-error text-on-error font-label-md text-label-md font-bold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-4 max-w-xs mx-auto bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg flex items-center justify-center gap-2 z-50">
          <span className="material-symbols-outlined text-[18px] text-secondary-fixed">check</span>
          <span className="font-body-sm text-body-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
