import React, { useState } from 'react';
import { Lab } from '../types';

interface SoftwareRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: (data: { labId?: string; softwareName: string; justification: string }) => void;
}

export const SoftwareRequestModal: React.FC<SoftwareRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted,
}) => {
  const [softwareName, setSoftwareName] = useState('');
  const [version, setVersion] = useState('');
  const [justification, setJustification] = useState('');
  const [priority, setPriority] = useState<'normal' | 'alta'>('normal');
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!softwareName.trim()) return;

    const ticketId = `#${Math.floor(4000 + Math.random() * 5000)}`;
    setGeneratedTicket(ticketId);
    setIsSuccess(true);

    onRequestSubmitted({
      softwareName: `${softwareName.trim()} ${version.trim()}`.trim(),
      justification: justification.trim(),
    });
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSoftwareName('');
    setVersion('');
    setJustification('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-outline-variant rounded-full mb-4 mx-auto sm:hidden"></div>

        {!isSuccess ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container/10 text-tertiary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">build</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Solicitar Instalação de Software
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Chamado institucional direto com a equipe técnica de TI (DTI)
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="req-software">
                    Nome do Software / Pacote
                  </label>
                  <input
                    id="req-software"
                    required
                    type="text"
                    placeholder="ex: PyTorch, Docker, Godot"
                    value={softwareName}
                    onChange={(e) => setSoftwareName(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-on-surface-variant/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="req-version">
                    Versão
                  </label>
                  <input
                    id="req-version"
                    type="text"
                    placeholder="ex: 2.3.1"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-on-surface-variant/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="req-just">
                  Disciplina / Finalidade
                </label>
                <textarea
                  id="req-just"
                  rows={2}
                  placeholder="Informe a turma ou roteiro de aula prática que utilizará o pacote."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-on-surface-variant/50 resize-none"
                />
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Prioridade de Atendimento</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">SLA Padrão: até 4 horas úteis</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold transition-all ${
                      priority === 'normal'
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('alta')}
                    className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold transition-all ${
                      priority === 'alta'
                        ? 'bg-tertiary-container text-on-tertiary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    Alta (Aula Hoje)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Abrir Chamado
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                task_alt
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Chamado {generatedTicket} Aberto!
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xs">
              A equipe de TI já foi notificada. Você receberá um aviso assim que a instalação for distribuída para as máquinas.
            </p>

            <div className="bg-surface-container-low p-3.5 rounded-xl w-full my-4 text-left space-y-1">
              <div className="flex justify-between font-label-sm text-label-sm">
                <span className="text-on-surface-variant">Software:</span>
                <span className="font-semibold text-on-surface">{softwareName} {version}</span>
              </div>
              <div className="flex justify-between font-label-sm text-label-sm">
                <span className="text-on-surface-variant">Previsão:</span>
                <span className="font-semibold text-secondary">~2 horas úteis</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-semibold active:scale-95 transition-transform"
            >
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
