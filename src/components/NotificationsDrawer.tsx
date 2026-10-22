import React from 'react';
import { NotificationItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-sm h-full shadow-2xl flex flex-col pt-safe animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Notificações
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-surface-container-low border-b border-outline-variant/20">
          <button
            onClick={onMarkAllAsRead}
            className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
            type="button"
          >
            Marcar todas como lidas
          </button>
          <button
            onClick={onClearNotifications}
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-error"
            type="button"
          >
            Limpar tudo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px] opacity-40 mb-2">notifications_off</span>
              <p className="font-body-md text-body-md">Nenhuma nova notificação</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.read
                    ? 'bg-surface-container-low/60 border-transparent text-on-surface-variant'
                    : 'bg-surface-container-lowest border-primary/20 shadow-sm text-on-surface'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        item.type === 'success'
                          ? 'text-secondary'
                          : item.type === 'warning'
                          ? 'text-tertiary-container'
                          : 'text-primary'
                      }`}
                    >
                      {item.type === 'success'
                        ? 'check_circle'
                        : item.type === 'warning'
                        ? 'warning'
                        : 'info'}
                    </span>
                    <h4 className="font-label-md text-label-md font-semibold line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                  {!item.read && <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1" />}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
                  {item.description}
                </p>
                <span className="font-label-sm text-label-sm text-outline-variant mt-2 block">
                  {item.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
