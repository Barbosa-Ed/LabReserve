import React, { useState } from 'react';
import { User } from '../types';
import { apiLogin } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('laboratorio');
  const [password, setPassword] = useState('lab123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Por favor, preencha o nome de usuário e a senha.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiLogin(cleanUser, cleanPass);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError('Falha ao autenticar.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar ao servidor de login.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient decorative blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/30 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container text-primary mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[34px]">meeting_room</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-black text-on-surface tracking-tight">
            LabReserve
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Gestão e Reserva de Laboratórios de Informática
          </p>
        </div>

        {/* Security Alert / Info */}
        <div className="mb-6 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">lock</span>
          <div className="text-xs text-on-surface-variant leading-relaxed">
            <span className="font-bold text-on-surface block">Acesso Seguro & Restrito</span>
            O login de administrador gerencia salas e usuários. Os professores têm acesso exclusivo às suas solicitações.
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error/30 text-error flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
              Usuário
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-on-surface-variant text-[20px]">
                person
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: laboratorio ou prof.andre"
                autoComplete="username"
                required
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder-on-surface-variant/40 border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-on-surface-variant text-[20px]">
                key
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                required
                className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder-on-surface-variant/40 border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-on-surface-variant hover:text-on-surface cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Validando acesso...</span>
              </>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Credentials */}
        <div className="mt-6 pt-5 border-t border-outline-variant/30">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-center mb-2.5">
            Credenciais Rápidas de Demonstração
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickLogin('laboratorio', 'lab123')}
              className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-left cursor-pointer transition-all active:scale-95 flex flex-col"
            >
              <div className="flex items-center gap-1 text-primary text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                <span>Administrador</span>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant mt-0.5">
                user: <strong>laboratorio</strong>
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant">
                senha: <strong>lab123</strong>
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickLogin('prof.andre', '123')}
              className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-left cursor-pointer transition-all active:scale-95 flex flex-col"
            >
              <div className="flex items-center gap-1 text-secondary text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">school</span>
                <span>Professor André</span>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant mt-0.5">
                user: <strong>prof.andre</strong>
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant">
                senha: <strong>123</strong>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
