import { Lab, Reservation, NotificationItem, User } from '../types';

const API_BASE = '/api';

// AUTH & USERS
export async function apiLogin(username: string, password: string): Promise<{ success: boolean; user: User; message: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha na autenticação.');
  }
  return res.json();
}

export async function apiChangePassword(username: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, currentPassword, newPassword }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao alterar senha.');
  }
  return res.json();
}

export async function apiGetUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Falha ao listar usuários.');
  return res.json();
}

export async function apiCreateUser(userData: {
  name: string;
  username: string;
  password?: string;
  role?: 'professor' | 'admin';
  siape?: string;
  department?: string;
  institute?: string;
  email?: string;
}): Promise<User> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao criar usuário.');
  }
  return res.json();
}

export async function apiUpdateUser(userId: string, userData: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao atualizar usuário.');
  }
  return res.json();
}

export async function apiDeleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Falha ao excluir usuário.');
}

/**
 * Robust API Client with transparent local fallback if server is unreachable
 */
export async function apiGetHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function apiReconnectDb(connectionString?: string) {
  const res = await fetch(`${API_BASE}/db/reconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connectionString }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// LABS
export async function apiGetLabs(): Promise<Lab[]> {
  const res = await fetch(`${API_BASE}/labs`);
  if (!res.ok) throw new Error('Falha ao carregar salas');
  return res.json();
}

export async function apiSaveLab(lab: Lab): Promise<Lab> {
  const isUpdate = !!lab.id;
  const url = isUpdate ? `${API_BASE}/labs/${lab.id}` : `${API_BASE}/labs`;
  const method = isUpdate ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lab),
  });
  if (!res.ok) throw new Error('Falha ao salvar sala');
  return res.json();
}

export async function apiDeleteLab(labId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/labs/${labId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Falha ao excluir sala');
}

// RESERVATIONS
export async function apiGetReservations(): Promise<Reservation[]> {
  const res = await fetch(`${API_BASE}/reservations`);
  if (!res.ok) throw new Error('Falha ao carregar reservas');
  return res.json();
}

export async function apiCreateReservation(reservation: Partial<Reservation>): Promise<Reservation> {
  const res = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservation),
  });
  if (!res.ok) throw new Error('Falha ao criar pedido de reserva');
  return res.json();
}

export async function apiApproveReservation(
  resId: string,
  labId: string,
  adminNotes?: string
): Promise<{ reservation: Reservation; lab: Lab }> {
  const res = await fetch(`${API_BASE}/reservations/${resId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId, adminNotes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao aprovar reserva');
  }
  return res.json();
}

export async function apiRejectReservation(resId: string, justification: string): Promise<Reservation> {
  const res = await fetch(`${API_BASE}/reservations/${resId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ justification }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao rejeitar reserva');
  }
  return res.json();
}

export async function apiDeleteReservation(resId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reservations/${resId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Falha ao cancelar reserva');
}

// NOTIFICATIONS
export async function apiGetNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/notifications`);
  if (!res.ok) throw new Error('Falha ao buscar notificações');
  return res.json();
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
}

export async function apiMarkAllNotificationsRead(): Promise<void> {
  await fetch(`${API_BASE}/notifications/mark-all-read`, { method: 'PATCH' });
}

export async function apiClearNotifications(): Promise<void> {
  await fetch(`${API_BASE}/notifications`, { method: 'DELETE' });
}

// SOFTWARE REQUESTS
export async function apiSubmitSoftwareRequest(data: {
  labId: string;
  softwareName: string;
  justification: string;
  priority?: string;
}) {
  const res = await fetch(`${API_BASE}/software-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Falha ao enviar chamado de software');
  return res.json();
}
