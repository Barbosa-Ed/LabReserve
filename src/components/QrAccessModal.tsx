import React, { useState } from 'react';
import { Reservation } from '../types';

interface QrAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: Reservation | null;
}

export const QrAccessModal: React.FC<QrAccessModalProps> = ({
  isOpen,
  onClose,
  reservation,
}) => {
  const [copied, setCopied] = useState(false);
  const [doorStatus, setDoorStatus] = useState<'locked' | 'unlocking' | 'unlocked'>('locked');

  if (!isOpen) return null;

  const code = reservation?.qrCodeText || 'LR-4092-B204';
  const labTitle = reservation
    ? (reservation.assignedLabCode ? `Sala ${reservation.assignedLabCode} - ${reservation.assignedLabName || ''}` : reservation.subject)
    : 'Laboratório 04 - Acesso Rápido';
  const location = reservation?.assignedLocation || 'Bloco B, Sala 204';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDoorUnlock = () => {
    setDoorStatus('unlocking');
    setTimeout(() => {
      setDoorStatus('unlocked');
      setTimeout(() => setDoorStatus('locked'), 4000);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-outline-variant rounded-full mb-4 sm:hidden"></div>

        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[28px]">lock_open</span>
        </div>

        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
          {labTitle}
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-4">
          Apresente este código no leitor RFID/ótico da porta do {location} para desbloqueio automático.
        </p>

        {/* Vector QR Graphic Representation */}
        <div className="p-4 bg-surface rounded-2xl shadow-inner mb-4 flex flex-col items-center w-full max-w-[240px]">
          <svg className="w-48 h-48 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
            <path d="M10 10h30v30h-30zM15 15v20h20v-20zM22 22h6v6h-6zM60 10h30v30h-30zM65 15v20h20v-20zM72 22h6v6h-6zM10 60h30v30h-30zM15 65v20h20v-20zM22 72h6v6h-6zM48 10h4v20h-4zM48 38h4v10h-4zM10 48h20v4h-20zM38 48h10v4h-10zM60 48h15v4h-15zM82 48h8v4h-8zM48 60h4v30h-4zM60 60h8v8h-8zM76 60h14v8h-14zM68 76h8v14h-8zM84 76h6v14h-6z" />
          </svg>

          <div className="flex items-center gap-2 mt-3 bg-surface-container-high px-3 py-1 rounded-lg">
            <span className="font-headline-sm text-headline-sm font-mono tracking-widest text-primary font-bold">
              {code}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copiar Código"
              className="p-1 hover:text-primary transition-colors text-on-surface-variant"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>
          </div>
        </div>

        {/* Validity badge */}
        <p className="font-label-sm text-label-sm text-secondary font-semibold mb-4 flex items-center gap-1.5 bg-secondary-container/30 px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
          <span>Válido até 16:45 de Hoje • Entrada liberada 15 min antes</span>
        </p>

        {/* Hardware Door Lock Integration Simulator */}
        <div className="w-full bg-surface-container-low rounded-xl p-3 mb-4 text-left flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              doorStatus === 'unlocked' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-primary'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {doorStatus === 'unlocked' ? 'meeting_room' : 'sensor_door'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Fechadura Digital Sala 204
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {doorStatus === 'unlocking' ? 'Autenticando chave...' : doorStatus === 'unlocked' ? 'Porta destrancada! Pode entrar.' : 'Pronta para leitura sem contato'}
              </span>
            </div>
          </div>

          <button
            onClick={handleSimulateDoorUnlock}
            disabled={doorStatus !== 'locked'}
            className="px-2.5 py-1 text-xs rounded-lg bg-surface-container-high text-primary font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
            type="button"
          >
            {doorStatus === 'unlocking' ? 'Lendo...' : doorStatus === 'unlocked' ? 'Liberado' : 'Testar'}
          </button>
        </div>

        <button
          className="w-full bg-surface-container text-on-surface h-12 rounded-xl font-label-lg text-label-lg hover:bg-surface-container-high transition-colors active:scale-95"
          onClick={onClose}
          type="button"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
