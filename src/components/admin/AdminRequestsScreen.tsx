import React, { useState } from 'react';
import { Reservation, Lab } from '../../types';

interface AdminRequestsScreenProps {
  reservations: Reservation[];
  labs: Lab[];
  onApproveReservation: (resId: string, labId: string, adminNotes?: string) => void;
  onRejectReservation: (resId: string, justification: string) => void;
  onViewTicket: (res: Reservation) => void;
}

export const AdminRequestsScreen: React.FC<AdminRequestsScreenProps> = ({
  reservations,
  labs,
  onApproveReservation,
  onRejectReservation,
  onViewTicket,
}) => {
  const [filter, setFilter] = useState<'pendente' | 'confirmada' | 'rejeitada' | 'todas'>('pendente');

  // Modal states for action
  const [approvingRes, setApprovingRes] = useState<Reservation | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const [rejectingRes, setRejectingRes] = useState<Reservation | null>(null);
  const [rejectionJustification, setRejectionJustification] = useState<string>('');
  const [justificationError, setJustificationError] = useState<string>('');

  const pendingCount = reservations.filter((r) => r.status === 'pendente').length;
  const confirmedCount = reservations.filter((r) => r.status === 'confirmada').length;
  const rejectedCount = reservations.filter((r) => r.status === 'rejeitada').length;

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'todas') return true;
    return r.status === filter;
  });

  const handleOpenApproveModal = (res: Reservation) => {
    setApprovingRes(res);
    // Find best matching lab based on capacity
    const bestLab = labs.find((l) => l.capacity >= res.studentsCount && l.status === 'livre') || labs[0];
    setSelectedLabId(bestLab?.id || '');
    setAdminNotes('');
  };

  const handleConfirmApproval = () => {
    if (approvingRes && selectedLabId) {
      onApproveReservation(approvingRes.id, selectedLabId, adminNotes);
      setApprovingRes(null);
    }
  };

  const handleOpenRejectModal = (res: Reservation) => {
    setRejectingRes(res);
    setRejectionJustification('');
    setJustificationError('');
  };

  const handleConfirmRejection = () => {
    if (!rejectionJustification.trim()) {
      setJustificationError('Por favor, informe a justificativa detalhada para o professor.');
      return;
    }
    if (rejectingRes) {
      onRejectReservation(rejectingRes.id, rejectionJustification.trim());
      setRejectingRes(null);
    }
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header with Stats Banner */}
      <section className="px-gutter pt-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                Painel do Administrador
              </span>
              <span className="text-on-surface-variant font-label-sm">• Gestão Acadêmica</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-1">
              Moderação de Pedidos de Salas
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Avalie as requisições de aula dos professores, verifique requisitos de software e confirme a alocação da sala ou justifique a rejeição.
            </p>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('pendente')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filter === 'pendente'
                ? 'bg-tertiary-container text-on-tertiary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            Pendentes ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('confirmada')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filter === 'confirmada'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Aprovadas ({confirmedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('rejeitada')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filter === 'rejeitada'
                ? 'bg-error text-on-error shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            Rejeitadas ({rejectedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('todas')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-semibold transition-all cursor-pointer ${
              filter === 'todas'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Todas ({reservations.length})
          </button>
        </div>
      </section>

      {/* Requests List Grid */}
      <section className="px-gutter py-2 flex flex-col gap-3.5">
        {filteredReservations.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-8 text-center text-on-surface-variant flex flex-col items-center justify-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">assignment_turned_in</span>
            <p className="font-title-md text-title-md font-semibold text-on-surface">Nenhum pedido nesta fila</p>
            <p className="font-body-sm text-body-sm mt-1">
              Todos os pedidos com status "{filter}" foram revisados ou não constam na base.
            </p>
          </div>
        ) : (
          filteredReservations.map((res) => {
            const isPending = res.status === 'pendente';
            const isConfirmed = res.status === 'confirmada';
            const isRejected = res.status === 'rejeitada';

            return (
              <article
                key={res.id}
                className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/25 flex flex-col gap-3 hover:shadow-md transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/15 pb-2.5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {res.subject}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded">
                        {res.protocol}
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                      <strong>{res.professorName}</strong> • SIAPE: {res.siape} • {res.assignedClass}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full font-label-sm text-label-sm font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                        Aguardando Sua Aprovação
                      </span>
                    )}
                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm font-bold">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Aprovada ({res.assignedLabCode || 'Sala'})
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-sm text-label-sm font-bold">
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        Rejeitada
                      </span>
                    )}
                  </div>
                </div>

                {/* Class Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-surface-container-low p-3 rounded-xl text-body-sm">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Data & Horário</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {res.dateFormatted}
                    </span>
                    <span className="text-xs text-primary font-bold">
                      {res.startTime} às {res.endTime} ({res.durationStr})
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Turma & Vagas</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold text-primary">
                      {res.studentsCount} Alunos
                    </span>
                    <span className="text-xs text-on-surface-variant">Requer lab com ≥ {res.studentsCount} computadores</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      {isConfirmed ? 'Sala Alocada' : 'Alocação Pretendida'}
                    </span>
                    {isConfirmed ? (
                      <div>
                        <span className="font-headline-sm text-headline-sm text-primary font-black">
                          {res.assignedLabCode}
                        </span>
                        <span className="text-xs text-on-surface-variant block">{res.assignedLocation}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-on-surface-variant mt-1">
                        A definir pelo Administrador
                      </span>
                    )}
                  </div>
                </div>

                {/* Software Requirements */}
                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Softwares Requisitados pelo Professor:
                  </span>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {res.requiredSoftware.length > 0 ? (
                      res.requiredSoftware.map((soft) => (
                        <span
                          key={soft}
                          className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">code</span>
                          {soft}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-on-surface-variant">Nenhum software específico exigido</span>
                    )}
                    {res.extraSoftware && (
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                        Extra: {res.extraSoftware}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rejection Justification Notice if rejected */}
                {isRejected && res.adminJustification && (
                  <div className="bg-error-container/40 border border-error/20 p-3 rounded-xl flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
                      report
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-error-container font-bold">
                        Justificativa enviada ao Professor:
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
                        {res.adminJustification}
                      </p>
                      <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                        Revisado por: {res.reviewedBy || 'Coordenação DTI'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/15">
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenApproveModal(res)}
                          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center gap-1.5 hover:bg-primary-container active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                          Aceitar e Alocar Sala
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(res)}
                          className="px-4 py-2 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md font-semibold flex items-center gap-1.5 hover:bg-error hover:text-white active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">cancel</span>
                          Rejeitar Pedido
                        </button>
                      </>
                    )}

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => onViewTicket(res)}
                        className="px-3.5 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5 hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        Ver Comprovante Oficial
                      </button>
                    )}
                  </div>

                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Criado em: {new Date(res.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* APPROVAL MODAL */}
      {approvingRes && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setApprovingRes(null)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">domain_verification</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Aprovar Alocação de Sala
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {approvingRes.subject} • {approvingRes.studentsCount} Alunos • {approvingRes.dateFormatted}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-label-md text-label-md text-on-surface font-semibold block">
                Selecione a Sala para Alocação (Padrão Bloco + Número):
              </label>

              <div className="flex flex-col gap-2">
                {labs.map((lab) => {
                  const hasCapacity = lab.capacity >= approvingRes.studentsCount;
                  const isSelected = selectedLabId === lab.id;

                  return (
                    <div
                      key={lab.id}
                      onClick={() => setSelectedLabId(lab.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary-fixed/20 ring-2 ring-primary/30'
                          : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono text-sm ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                        }`}>
                          {lab.code}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-md text-title-md text-on-surface font-bold">
                            Sala {lab.code} ({lab.block}, {lab.floor})
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Capacidade: {lab.capacity} PCs • {lab.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className={`font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full ${
                          hasCapacity
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {hasCapacity ? `Sobra ${lab.capacity - approvingRes.studentsCount} vagas` : `Faltam ${approvingRes.studentsCount - lab.capacity} vagas`}
                        </span>
                        <span className="text-xs text-on-surface-variant mt-0.5">
                          Status: {lab.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1 pt-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold block" htmlFor="admin-notes">
                  Observações para o Professor (Opcional)
                </label>
                <textarea
                  id="admin-notes"
                  rows={2}
                  placeholder="ex: Chave digital liberada. Estações 01 a 35 preparadas com login acadêmico."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setApprovingRes(null)}
                className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={!selectedLabId}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                Confirmar Alocação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL WITH MANDATORY JUSTIFICATION */}
      {rejectingRes && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setRejectingRes(null)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
              <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Rejeitar Pedido de Reserva
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {rejectingRes.subject} • {rejectingRes.professorName}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface font-semibold block" htmlFor="rejection-justification">
                Justificativa Obrigatória para o Docente:
              </label>
              <textarea
                id="rejection-justification"
                required
                rows={4}
                placeholder="Informe o motivo da não aprovação (ex: indisponibilidade de máquinas com GPU no horário, conflito de grade, manutenção preventiva no bloco, etc.)"
                value={rejectionJustification}
                onChange={(e) => {
                  setRejectionJustification(e.target.value);
                  if (justificationError) setJustificationError('');
                }}
                className={`w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-error/40 border resize-none ${
                  justificationError ? 'border-error' : 'border-outline-variant/30'
                }`}
              />
              {justificationError && (
                <span className="text-xs text-error font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {justificationError}
                </span>
              )}

              <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-2.5 rounded-lg">
                ℹ️ Esta justificativa será enviada imediatamente por notificação ao professor <strong>{rejectingRes.professorName}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setRejectingRes(null)}
                className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-5 py-2.5 rounded-xl bg-error text-on-error font-label-md text-label-md font-bold hover:bg-red-700 transition-all shadow-sm active:scale-95"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
