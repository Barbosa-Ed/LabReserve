import React from 'react';
import { UserRole } from '../types';

export type NavTab = 'inicio' | 'nova-reserva' | 'laboratorios' | 'historico' | 'admin-pedidos' | 'admin-salas' | 'admin-usuarios';

interface BottomNavProps {
  currentTab: NavTab;
  currentRole: UserRole;
  onSelectTab: (tab: NavTab) => void;
  pendingRequestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  currentRole,
  onSelectTab,
  pendingRequestsCount = 0,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_10px_rgba(0,0,0,0.06)] border-t border-outline-variant/30">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-space-xs">
        {currentRole === 'professor' ? (
          <>
            {/* Início */}
            <button
              onClick={() => onSelectTab('inicio')}
              type="button"
              aria-label="Início"
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
                currentTab === 'inicio'
                  ? 'text-primary font-label-md font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={currentTab === 'inicio' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                calendar_today
              </span>
              <span className="font-label-sm text-label-sm">Início</span>
            </button>

            {/* Pedir Sala (CTA Centralizado) */}
            <button
              onClick={() => onSelectTab('nova-reserva')}
              type="button"
              aria-label="Pedir Sala"
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-all cursor-pointer ${
                currentTab === 'nova-reserva'
                  ? 'text-primary font-label-md font-bold scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm transition-transform active:scale-95">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </div>
              <span className="font-label-sm text-label-sm">Pedir Sala</span>
            </button>

            {/* Histórico */}
            <button
              onClick={() => onSelectTab('historico')}
              type="button"
              aria-label="Minhas Reservas"
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
                currentTab === 'historico'
                  ? 'text-primary font-label-md font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={currentTab === 'historico' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                schedule
              </span>
              <span className="font-label-sm text-label-sm">Minhas Reservas</span>
            </button>
          </>
        ) : (
          <>
            {/* Admin: Moderar Pedidos */}
            <button
              onClick={() => onSelectTab('admin-pedidos')}
              type="button"
              aria-label="Moderar Pedidos"
              className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
                currentTab === 'admin-pedidos'
                  ? 'text-primary font-label-md font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={currentTab === 'admin-pedidos' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                how_to_reg
              </span>
              <span className="font-label-sm text-label-sm">Pedidos</span>
              {pendingRequestsCount > 0 && (
                <span className="absolute top-1 right-2 min-w-[18px] h-[18px] rounded-full bg-tertiary-container text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* Admin: Gerenciar Salas */}
            <button
              onClick={() => onSelectTab('admin-salas')}
              type="button"
              aria-label="Gerenciar Salas"
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
                currentTab === 'admin-salas'
                  ? 'text-primary font-label-md font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={currentTab === 'admin-salas' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                meeting_room
              </span>
              <span className="font-label-sm text-label-sm">Salas (CRUD)</span>
            </button>

            {/* Admin: Professores / Usuários */}
            <button
              onClick={() => onSelectTab('admin-usuarios')}
              type="button"
              aria-label="Professores e Usuários"
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
                currentTab === 'admin-usuarios'
                  ? 'text-primary font-label-md font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={currentTab === 'admin-usuarios' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                group
              </span>
              <span className="font-label-sm text-label-sm">Usuários</span>
            </button>

            {/* Admin: Histórico Geral */}
            <button
              onClick={() => onSelectTab('historico')}
              type="button"
              aria-label="Histórico Geral"
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
                currentTab === 'historico'
                  ? 'text-primary font-label-md font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={currentTab === 'historico' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                history
              </span>
              <span className="font-label-sm text-label-sm">Histórico</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
