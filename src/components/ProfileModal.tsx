import React from 'react';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  activeCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenChangePassword,
  onLogout,
  activeCount,
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';

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

        {/* Profile Avatar & Title */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-outline-variant/30">
          <div className="relative mb-3">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-md ring-4 ${
              isAdmin ? 'bg-primary-container text-primary ring-primary/20' : 'bg-secondary-container text-secondary ring-secondary/20'
            }`}>
              {currentUser.name.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-secondary ring-2 ring-white flex items-center justify-center text-white text-[12px] font-bold">
              ✓
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5">
            {isAdmin ? 'Administrador do Sistema' : 'Docente / Professor'}
          </div>

          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            {currentUser.name}
          </h3>
          <span className="font-mono text-xs text-primary font-bold mt-0.5">
            @{currentUser.username} {currentUser.siape ? `• SIAPE: ${currentUser.siape}` : ''}
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {currentUser.department || 'Universidade'}
          </p>
          <span className="font-label-sm text-label-sm text-outline mt-0.5">
            {currentUser.institute || 'Campus Central'}
          </span>
        </div>

        {/* User Details */}
        <div className="space-y-2.5 my-4">
          <div className="bg-surface-container-low p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">E-mail Institucional</span>
                <span className="font-body-md text-body-md text-on-surface font-medium truncate max-w-[220px]">
                  {currentUser.email || `${currentUser.username}@universidade.edu.br`}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {isAdmin ? 'Controle Geral' : 'Suas Reservas Aprovadas'}
                </span>
                <span className="font-body-md text-body-md text-on-surface font-bold">
                  {isAdmin ? 'Acesso total de moderação e salas' : `${activeCount} aulas alocadas`}
                </span>
              </div>
            </div>
            <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
              Autenticado
            </span>
          </div>
        </div>

        {/* Actions: Change Password & Logout */}
        <div className="space-y-2 pt-2 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenChangePassword();
            }}
            className="w-full h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">key</span>
            <span>Alterar Senha</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full h-11 rounded-xl bg-error-container/30 hover:bg-error-container/60 text-error font-label-md text-label-md font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sair da Conta</span>
          </button>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="mt-3 w-full h-11 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container transition-colors active:scale-95 cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
