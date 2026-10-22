import { Router, Request, Response } from 'express';
import {
  initDatabase,
  getDbStatus,
  dbGetLabs,
  dbSaveLab,
  dbDeleteLab,
  dbGetReservations,
  dbCreateReservation,
  dbApproveReservation,
  dbRejectReservation,
  dbDeleteReservation,
  dbGetNotifications,
  dbCreateNotification,
  dbMarkNotificationRead,
  dbMarkAllNotificationsRead,
  dbClearNotifications,
  dbCreateSoftwareRequest,
  dbGetUsers,
  dbGetUserByUsername,
  dbCreateUser,
  dbUpdateUser,
  dbUpdateUserPassword,
  dbDeleteUser,
} from './db.ts';
import { Lab, Reservation, NotificationItem, User } from '../types.ts';

export const apiRouter = Router();

// ----------------------------------------------------
// AUTH & USERS ROUTES
// ----------------------------------------------------

// Login endpoint with validation
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Informe usuário e senha.' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  try {
    const user = await dbGetUserByUsername(cleanUser);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas. Usuário não encontrado.' });
    }

    // Check password
    if (user.password !== cleanPass) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      message: 'Autenticado com sucesso.',
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password endpoint
apiRouter.post('/auth/change-password', async (req: Request, res: Response) => {
  const { username, currentPassword, newPassword } = req.body;
  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Todos os campos de senha são obrigatórios.' });
  }

  try {
    const user = await dbGetUserByUsername(username);
    if (!user || user.password !== currentPassword) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 4 caracteres.' });
    }

    await dbUpdateUserPassword(username, newPassword);
    res.json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List users (for Admin)
apiRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await dbGetUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new user (Admin creates Professor or other accounts)
apiRouter.post('/users', async (req: Request, res: Response) => {
  const { name, username, password, role, siape, department, institute, email } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Nome, nome de usuário e senha são obrigatórios.' });
  }

  try {
    const existing = await dbGetUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Nome de usuário já está em uso.' });
    }

    const newUser = await dbCreateUser({
      name,
      username,
      password,
      role: role || 'professor',
      siape,
      department,
      institute,
      email,
    });

    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update user (Admin modifies any professor info)
apiRouter.put('/users/:id', async (req: Request, res: Response) => {
  const { name, username, password, role, siape, department, institute, email } = req.body;
  try {
    const updated = await dbUpdateUser(req.params.id, {
      name,
      username,
      password,
      role,
      siape,
      department,
      institute,
      email,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (Admin)
apiRouter.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    await dbDeleteUser(req.params.id);
    res.json({ success: true, message: 'Usuário removido com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health & Database Connection status
apiRouter.get('/health', async (_req: Request, res: Response) => {
  try {
    const status = await getDbStatus();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ...status,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Reconnect or test custom PostgreSQL connection string
apiRouter.post('/db/reconnect', async (req: Request, res: Response) => {
  const { connectionString } = req.body;
  try {
    const result = await initDatabase(connectionString);
    const status = await getDbStatus();
    res.json({ ...result, ...status });
  } catch (err: any) {
    res.status(500).json({ connected: false, message: err.message });
  }
});

// LABS ROUTES
apiRouter.get('/labs', async (_req: Request, res: Response) => {
  try {
    const labs = await dbGetLabs();
    res.json(labs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/labs', async (req: Request, res: Response) => {
  try {
    const lab: Lab = req.body;
    if (!lab.code || !lab.name || !lab.block) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes (código, nome, bloco).' });
    }
    const saved = await dbSaveLab(lab);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/labs/:id', async (req: Request, res: Response) => {
  try {
    const lab: Lab = req.body;
    lab.id = req.params.id;
    const saved = await dbSaveLab(lab);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/labs/:id', async (req: Request, res: Response) => {
  try {
    await dbDeleteLab(req.params.id);
    res.json({ success: true, message: 'Sala excluída com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// RESERVATIONS ROUTES
apiRouter.get('/reservations', async (_req: Request, res: Response) => {
  try {
    const reservations = await dbGetReservations();
    res.json(reservations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/reservations', async (req: Request, res: Response) => {
  try {
    const reservation: Reservation = req.body;
    if (!reservation.subject || !reservation.dateStr || !reservation.startTime || !reservation.endTime) {
      return res.status(400).json({ error: 'Dados da aula incompletos (matéria, data, início e término).' });
    }

    if (!reservation.id) {
      reservation.id = `res-${Date.now()}`;
    }
    if (!reservation.protocol) {
      reservation.protocol = `#LR-2023-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!reservation.createdAt) {
      reservation.createdAt = new Date().toISOString();
    }
    reservation.status = 'pendente'; // Professor requests always start as pending for Admin review

    const created = await dbCreateReservation(reservation);

    // Create Admin notification
    await dbCreateNotification({
      id: `notif-admin-${Date.now()}`,
      title: 'Novo Pedido de Reserva Pendente',
      description: `${created.professorName} solicitou sala para ${created.subject} (${created.studentsCount} alunos) em ${created.dateFormatted}.`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'info',
      targetRole: 'admin',
      reservationId: created.id,
    });

    // Create Professor notification
    await dbCreateNotification({
      id: `notif-prof-${Date.now()}`,
      title: 'Solicitação Enviada para Moderação',
      description: `Seu pedido para ${created.subject} (${created.protocol}) foi registrado e está sob análise da Coordenação/DTI.`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'info',
      targetRole: 'professor',
      reservationId: created.id,
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN APPROVAL
apiRouter.patch('/reservations/:id/approve', async (req: Request, res: Response) => {
  const { labId, adminNotes } = req.body;
  if (!labId) {
    return res.status(400).json({ error: 'É necessário selecionar uma sala (labId) para aprovação.' });
  }

  try {
    const result = await dbApproveReservation(req.params.id, labId, adminNotes);
    if (!result) {
      return res.status(404).json({ error: 'Reserva ou sala não encontrada.' });
    }

    // Notify professor
    await dbCreateNotification({
      id: `notif-appr-${Date.now()}`,
      title: `Reserva Aprovada: Sala ${result.lab.code}`,
      description: `Sua solicitação de aula para ${result.reservation.subject} foi confirmada pelo DTI. Sala alocada: ${result.lab.code} (${result.lab.block}, Sala ${result.lab.roomNumber}). Chave digital liberada!`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'success',
      targetRole: 'professor',
      reservationId: result.reservation.id,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN REJECTION WITH MANDATORY JUSTIFICATION
apiRouter.patch('/reservations/:id/reject', async (req: Request, res: Response) => {
  const { justification } = req.body;
  if (!justification || !justification.trim()) {
    return res.status(400).json({ error: 'A justificativa de rejeição é obrigatória.' });
  }

  try {
    const rejected = await dbRejectReservation(req.params.id, justification.trim());
    if (!rejected) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    // Notify professor with justification
    await dbCreateNotification({
      id: `notif-rej-${Date.now()}`,
      title: `Solicitação Não Aprovada: ${rejected.subject}`,
      description: `Justificativa da Administração: ${justification.trim()}`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'error',
      targetRole: 'professor',
      reservationId: rejected.id,
    });

    res.json(rejected);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/reservations/:id', async (req: Request, res: Response) => {
  try {
    await dbDeleteReservation(req.params.id);
    res.json({ success: true, message: 'Reserva cancelada com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// NOTIFICATIONS ROUTES
apiRouter.get('/notifications', async (_req: Request, res: Response) => {
  try {
    const notifications = await dbGetNotifications();
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/notifications', async (req: Request, res: Response) => {
  try {
    const notif: NotificationItem = req.body;
    if (!notif.id) notif.id = `notif-${Date.now()}`;
    const created = await dbCreateNotification(notif);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    await dbMarkNotificationRead(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/notifications/mark-all-read', async (_req: Request, res: Response) => {
  try {
    await dbMarkAllNotificationsRead();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/notifications', async (_req: Request, res: Response) => {
  try {
    await dbClearNotifications();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SOFTWARE REQUESTS ROUTE
apiRouter.post('/software-requests', async (req: Request, res: Response) => {
  try {
    const { labId, softwareName, justification, priority } = req.body;
    if (!labId || !softwareName) {
      return res.status(400).json({ error: 'Sala e nome do software são obrigatórios.' });
    }

    const created = await dbCreateSoftwareRequest({ labId, softwareName, justification, priority });

    // Notify admin
    await dbCreateNotification({
      id: `notif-soft-${Date.now()}`,
      title: `Novo Chamado de Software ${created.ticketCode}`,
      description: `Solicitada instalação de ${softwareName} no laboratório.`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'warning',
      targetRole: 'admin',
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
