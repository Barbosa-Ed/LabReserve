import React, { useState } from 'react';
import { apiReconnectDb } from '../../services/api';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: {
    database: string;
    isConnected: boolean;
    error: string | null;
    tableCounts: {
      labs: number;
      reservations: number;
      notifications: number;
    };
  } | null;
  onRefresh: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
  onRefresh,
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      const res = await apiReconnectDb(customUrl.trim() || undefined);
      setTestResult({
        connected: res.isConnected,
        message: res.isConnected
          ? 'Conexão com PostgreSQL estabelecida e tabelas verificadas com sucesso!'
          : res.error || res.message || 'Não foi possível conectar ao PostgreSQL.',
      });
      onRefresh();
    } catch (err: any) {
      setTestResult({
        connected: false,
        message: err.message || 'Erro ao tentar conectar ao banco de dados.',
      });
    } finally {
      setTesting(false);
    }
  };

  const isPg = dbStatus?.isConnected;

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isPg ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
            }`}>
              <span className="material-symbols-outlined text-[24px]">database</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                Integração PostgreSQL
                <span className={`w-2.5 h-2.5 rounded-full ${isPg ? 'bg-secondary animate-pulse' : 'bg-tertiary-container'}`}></span>
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Status do motor de banco de dados e sincronização de tabelas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Status Card */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
          isPg
            ? 'bg-secondary-container/20 border-secondary/30 text-on-surface'
            : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">
              Motor de Dados Ativo
            </span>
            <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
              isPg
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
            }`}>
              {isPg ? 'PostgreSQL Ativo' : 'Armazenamento Resiliente'}
            </span>
          </div>

          <div className="text-xl font-bold font-mono text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">terminal</span>
            {dbStatus?.database || 'PostgreSQL'}
          </div>

          {dbStatus?.error && (
            <p className="text-xs text-on-surface-variant bg-surface-container p-2 rounded-lg mt-1 font-mono">
              Nota: {dbStatus.error}
            </p>
          )}

          {/* Table Counts */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/20 mt-1">
            <div className="flex flex-col text-center bg-surface-container-lowest p-2 rounded-lg">
              <span className="text-xs text-on-surface-variant font-medium">Salas</span>
              <span className="text-lg font-bold text-primary font-mono">{dbStatus?.tableCounts.labs ?? 0}</span>
            </div>
            <div className="flex flex-col text-center bg-surface-container-lowest p-2 rounded-lg">
              <span className="text-xs text-on-surface-variant font-medium">Reservas</span>
              <span className="text-lg font-bold text-primary font-mono">{dbStatus?.tableCounts.reservations ?? 0}</span>
            </div>
            <div className="flex flex-col text-center bg-surface-container-lowest p-2 rounded-lg">
              <span className="text-xs text-on-surface-variant font-medium">Notificações</span>
              <span className="text-lg font-bold text-primary font-mono">{dbStatus?.tableCounts.notifications ?? 0}</span>
            </div>
          </div>
        </div>

        {/* PostgreSQL Connection String Form */}
        <form onSubmit={handleTestConnection} className="flex flex-col gap-3">
          <label className="font-label-md text-label-md text-on-surface font-semibold block">
            Configurar Conexão PostgreSQL (DATABASE_URL):
          </label>
          <input
            type="text"
            placeholder="postgresql://postgres:senha@localhost:5432/labreserve"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-mono text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCustomUrl('postgresql://postgres:postgres@localhost:5432/labreserve')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Usar Padrão Local (localhost:5432)
            </button>

            <button
              type="submit"
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              {testing ? 'Testando...' : 'Testar & Conectar'}
            </button>
          </div>
        </form>

        {/* Test Result Alert */}
        {testResult && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
            testResult.connected
              ? 'bg-secondary-container/40 text-on-secondary-container border border-secondary/30'
              : 'bg-error-container/40 text-on-error-container border border-error/30'
          }`}>
            <span className="material-symbols-outlined text-[18px] shrink-0">
              {testResult.connected ? 'check_circle' : 'warning'}
            </span>
            <div className="flex flex-col">
              <span className="font-bold">{testResult.connected ? 'Sucesso!' : 'Aviso de Conexão'}</span>
              <span>{testResult.message}</span>
            </div>
          </div>
        )}

        {/* Quick Help for PostgreSQL Docker command */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm text-on-surface font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">info</span>
            Dica: Como subir o PostgreSQL localmente via Docker
          </span>
          <code className="text-[11px] font-mono bg-surface-container p-2 rounded-lg text-on-surface select-all block overflow-x-auto">
            docker run -d --name labreserve-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=labreserve postgres:16-alpine
          </code>
        </div>

        <div className="flex justify-end pt-2 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
