import React from 'react';
import { User, UserRole } from '../types';

interface HeaderProps {
  subtitle: string;
  currentUser: User;
  onLogout: () => void;
  onOpenChangePassword: () => void;
  showBack?: boolean;
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenDbModal?: () => void;
  isDbConnected?: boolean;
  unreadCount?: number;
  currentTab: string;
  onSelectTab: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  subtitle,
  currentUser,
  onLogout,
  onOpenChangePassword,
  showBack = false,
  onBack,
  onOpenNotifications,
  onOpenProfile,
  onOpenDbModal,
  isDbConnected = false,
  unreadCount = 2,
  currentTab,
  onSelectTab,
}) => {
  const currentRole = currentUser.role;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-outline-variant/20">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand & Back button */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              aria-label="Voltar"
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-container-high transition-colors active:scale-95 cursor-pointer"
              onClick={onBack}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          )}

          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => onSelectTab(currentRole === 'admin' ? 'admin-pedidos' : 'inicio')}
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">meeting_room</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-primary leading-none font-black tracking-tight flex items-center gap-1.5">
                LabReserve
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  currentRole === 'admin'
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {currentRole === 'admin' ? 'Admin' : 'Docente'}
                </span>
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-none mt-1 truncate max-w-[200px]">
                {subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Links (Visible on tablets and desktop browsers) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {currentRole === 'professor' ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('inicio')}
                className={`px-3 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer ${
                  currentTab === 'inicio'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Início
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('nova-reserva')}
                className={`px-3 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer ${
                  currentTab === 'nova-reserva'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Pedir Sala
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('historico')}
                className={`px-3 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer ${
                  currentTab === 'historico'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Minhas Reservas
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('admin-pedidos')}
                className={`px-3 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'admin-pedidos'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                Moderar Pedidos
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('admin-salas')}
                className={`px-3 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'admin-salas'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                Gerenciar Salas (CRUD)
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('admin-usuarios')}
                className={`px-3 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'admin-usuarios'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">group</span>
                Professores / Usuários
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('historico')}
                className={`px-3 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'historico'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">history</span>
                Histórico Geral
              </button>
            </>
          )}
        </nav>

        {/* Right: Database Pill, Change Password, Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Database PostgreSQL Status Trigger */}
          {onOpenDbModal && (
            <button
              type="button"
              onClick={onOpenDbModal}
              title={isDbConnected ? 'PostgreSQL Conectado' : 'Clique para ver/conectar PostgreSQL'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-bold border border-outline-variant/30 cursor-pointer transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">database</span>
              <span className="hidden lg:inline font-mono text-[11px]">Postgres</span>
              <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-secondary animate-pulse' : 'bg-tertiary-container'}`}></span>
            </button>
          )}

          {/* Change Password Button */}
          <button
            type="button"
            onClick={onOpenChangePassword}
            title="Alterar Minha Senha"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold border border-outline-variant/30 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">key</span>
            <span className="hidden xl:inline">Senha</span>
          </button>

          {/* Notifications Trigger */}
          <button
            aria-label="Notificações"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            onClick={onOpenNotifications}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface animate-pulse" />
            )}
          </button>

          {/* Profile Trigger */}
          <button
            aria-label="Perfil do Usuário"
            className="flex items-center gap-2 rounded-full p-1 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 transition-all active:scale-95 cursor-pointer"
            onClick={onOpenProfile}
            type="button"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentRole === 'admin' ? 'bg-primary-container text-primary' : 'bg-secondary-container text-secondary'
            }`}>
              {currentUser.name.charAt(0)}
            </div>
            <span className="hidden lg:inline text-xs font-bold text-on-surface truncate max-w-[120px]">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Sair do Sistema"
            className="w-9 h-9 rounded-full flex items-center justify-center text-error hover:bg-error-container/30 transition-colors cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
