import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser } from '../../services/api';

interface AdminUsersScreenProps {
  currentUser: User;
}

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'professor' | 'admin'>('professor');
  const [siape, setSiape] = useState('');
  const [department, setDepartment] = useState('Departamento de Ciência da Computação');
  const [institute, setInstitute] = useState('ICET');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiGetUsers();
      setUsers(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('professor');
    setSiape(`${Math.floor(100000 + Math.random() * 900000)}`);
    setDepartment('Departamento de Ciência da Computação');
    setInstitute('ICET');
    setEmail('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPassword(''); // leave empty to not change
    setRole(user.role);
    setSiape(user.siape || '');
    setDepartment(user.department || '');
    setInstitute(user.institute || '');
    setEmail(user.email || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !username.trim()) {
      setFormError('Nome e nome de usuário são obrigatórios.');
      return;
    }

    if (!editingUserId && !password.trim()) {
      setFormError('A senha é obrigatória para novos usuários.');
      return;
    }

    try {
      if (editingUserId) {
        // Edit existing user
        const updatePayload: Partial<User> = {
          name: name.trim(),
          username: username.trim().toLowerCase(),
          role,
          siape: siape.trim(),
          department: department.trim(),
          institute: institute.trim(),
          email: email.trim(),
        };
        if (password.trim()) {
          updatePayload.password = password.trim();
        }

        const updated = await apiUpdateUser(editingUserId, updatePayload);
        setUsers((prev) => prev.map((u) => (u.id === editingUserId ? updated : u)));
        setIsModalOpen(false);
        setToastMessage(`Informações de "${updated.name}" atualizadas com sucesso!`);
      } else {
        // Create new user
        const created = await apiCreateUser({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          role,
          siape: siape.trim(),
          department: department.trim(),
          institute: institute.trim(),
          email: email.trim() || `${username.trim().toLowerCase()}@universidade.edu.br`,
        });

        setUsers((prev) => [...prev, created]);
        setIsModalOpen(false);
        setToastMessage(`Usuário "${created.username}" cadastrado com sucesso!`);
      }
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao processar usuário.');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await apiDeleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
      setToastMessage('Usuário excluído com sucesso.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setToastMessage('Erro ao excluir usuário: ' + err.message);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.siape && u.siape.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <section className="px-gutter pt-4 pb-2 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                Administração
              </span>
              <span className="text-on-surface-variant font-label-sm">• Controle de Acessos</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-1">
              Gerenciar Usuários & Professores
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Cadastre novos professores e altere quaisquer informações dos docentes (nome, usuário, senha, SIAPE, depto).
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="self-start sm:self-auto h-11 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span>Novo Professor</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, usuário, SIAPE ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </section>

      {/* Users List Grid */}
      <section className="px-gutter mt-3">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Carregando usuários...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-[40px] block mb-2">person_off</span>
            <p className="font-title-md text-title-md font-bold text-on-surface">Nenhum usuário encontrado</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Clique em &quot;Novo Professor&quot; para cadastrar uma nova conta.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const isAdmin = u.role === 'admin';
              const isSelf = u.id === currentUser.id;

              return (
                <div
                  key={u.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${
                            isAdmin
                              ? 'bg-primary-container text-primary'
                              : 'bg-secondary-container text-secondary'
                          }`}
                        >
                          {isAdmin ? (
                            <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
                          ) : (
                            <span className="material-symbols-outlined text-[22px]">school</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-title-md text-title-md font-bold text-on-surface leading-tight">
                            {u.name}
                          </h3>
                          <span className="font-mono text-xs text-on-surface-variant">
                            @{u.username}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-primary-container text-primary'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {isAdmin ? 'Admin' : 'Docente'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-on-surface-variant bg-surface-container-low/60 rounded-xl p-3 border border-outline-variant/20 mb-4">
                      {u.siape && (
                        <div className="flex items-center justify-between">
                          <span className="text-outline">SIAPE:</span>
                          <span className="font-mono font-semibold text-on-surface">{u.siape}</span>
                        </div>
                      )}
                      {u.department && (
                        <div className="flex items-center justify-between">
                          <span className="text-outline">Depto:</span>
                          <span className="font-semibold text-on-surface truncate max-w-[170px]" title={u.department}>
                            {u.department}
                          </span>
                        </div>
                      )}
                      {u.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-outline">E-mail:</span>
                          <span className="font-medium text-on-surface truncate max-w-[170px]" title={u.email}>
                            {u.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      className="px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer"
                      title="Editar todas as informações do professor"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Editar Dados</span>
                    </button>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => setUserToDelete(u)}
                        className="px-2.5 py-1 text-xs text-error hover:bg-error-container/30 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer"
                        title="Excluir usuário"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Excluir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal: Create or Edit User */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">
                    {editingUserId ? 'manage_accounts' : 'person_add'}
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {editingUserId ? 'Editar Informações do Usuário' : 'Cadastrar Usuário'}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {editingUserId
                      ? 'Altere nome, login, senha, SIAPE ou departamento do professor.'
                      : 'Crie o acesso para o docente solicitar salas no LabReserve.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-error-container/30 border border-error/20 text-error text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prof. Dr. Carlos Eduardo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Nome de Usuário (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: prof.carlos"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    {editingUserId ? 'Nova Senha (opcional)' : 'Senha de Acesso *'}
                  </label>
                  <input
                    type="text"
                    required={!editingUserId}
                    placeholder={editingUserId ? 'Deixe em branco para manter' : 'Senha inicial'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Perfil de Acesso
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  >
                    <option value="professor">Docente / Professor</option>
                    <option value="admin">Administrador (DTI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    SIAPE / Matrícula
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 219842"
                    value={siape}
                    onChange={(e) => setSiape(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    placeholder="email@universidade.edu.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/30 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
                >
                  {editingUserId ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {userToDelete && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setUserToDelete(null)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-outline-variant/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
              Excluir Usuário?
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Tem certeza que deseja remover o usuário <strong>{userToDelete.name}</strong> (@{userToDelete.username})?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 h-11 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="flex-1 h-11 rounded-xl bg-error text-on-error font-label-md font-bold cursor-pointer shadow-sm"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
