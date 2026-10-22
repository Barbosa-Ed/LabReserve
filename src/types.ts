export type UserRole = 'professor' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string; // stored hashed or plain for demo
  role: UserRole;
  siape?: string;
  department?: string;
  institute?: string;
  email?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}

export interface ScheduleSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reservationId: string;
  subject: string;
  professorName: string;
}

export interface Lab {
  id: string;
  code: string; // e.g. "B204", "C302", "A102" - Standard Bloco + Número
  name: string; // e.g. "B204 - Laboratório de Desenvolvimento"
  category: string;
  block: string; // "Bloco B"
  floor: string; // "2º Andar"
  roomNumber: string; // "204"
  capacity: number; // Tamanho da sala (computadores)
  cpu: string;
  ram: string;
  storage: string;
  gpu?: string;
  installedSoftware: string[];
  airConditioned: boolean;
  projector: string;
  whiteBoard: boolean;
  noBreak: boolean;
  availableHours: string;
  status: 'livre' | 'reservada' | 'manutencao';
  scheduleSlots?: ScheduleSlot[];
  image?: string;
}

export type ReservationStatus = 'pendente' | 'confirmada' | 'rejeitada' | 'aguardando_ti' | 'concluida';

export interface Reservation {
  id: string;
  protocol: string; // e.g. "#LR-2023-8941"
  subject: string;
  course: string;
  assignedClass: string;
  professorName: string;
  professorId: string;
  siape: string;

  // Class specs requested by professor
  studentsCount: number;
  dateStr: string; // YYYY-MM-DD
  dateFormatted: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationStr: string;
  requiredSoftware: string[];
  extraSoftware?: string;

  // Administrative Allocation
  status: ReservationStatus;
  assignedLabId?: string;
  assignedLabCode?: string; // e.g. "B204", "C302"
  assignedLabName?: string;
  assignedLocation?: string; // "Bloco B, Sala 204"
  totalStations?: number;

  adminJustification?: string; // Rejection justification or admin notes
  reviewedAt?: string;
  reviewedBy?: string;

  requiresItSupport?: boolean;
  itTicket?: {
    id: string;
    description: string;
    estimatedTime: string;
    status: 'em_andamento' | 'concluido' | 'pendente';
  };
  qrCodeText: string;
  createdAt: string;
}

export interface SoftwareCategory {
  id: string;
  title: string;
  items: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert' | 'error';
  targetRole?: UserRole; // 'professor' or 'admin'
  reservationId?: string;
}
