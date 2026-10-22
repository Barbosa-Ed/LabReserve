import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Lab, Reservation, NotificationItem, User } from '../types.ts';
import { INITIAL_LABS, INITIAL_RESERVATIONS, INITIAL_NOTIFICATIONS } from '../data/mockData.ts';

dotenv.config();

const { Pool } = pg;

// Connection options
const connectionString = process.env.DATABASE_URL || undefined;

let pool: pg.Pool | null = null;
let isConnected = false;
let connectionError: string | null = null;

// Local fallback store file path
const STORE_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.resolve(STORE_DIR, 'db_store.json');

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Eng. Roberto Ramos',
    username: 'laboratorio',
    password: 'lab123',
    role: 'admin',
    siape: 'DTI-88491',
    department: 'Diretoria de Tecnologia da Informação',
    institute: 'DTI Central',
    email: 'laboratorio@universidade.edu.br',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-prof-andre',
    name: 'Prof. Dr. André Silva',
    username: 'prof.andre',
    password: '123',
    role: 'professor',
    siape: '198421',
    department: 'Departamento de Ciência da Computação',
    institute: 'ICET',
    email: 'andre.silva@universidade.edu.br',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-prof-mariana',
    name: 'Profa. Dra. Mariana Costa',
    username: 'prof.mariana',
    password: '123',
    role: 'professor',
    siape: '204918',
    department: 'Departamento de Engenharia Elétrica',
    institute: 'ICET',
    email: 'mariana.costa@universidade.edu.br',
    createdAt: new Date().toISOString(),
  },
];

interface FallbackStore {
  users: User[];
  labs: Lab[];
  reservations: Reservation[];
  notifications: NotificationItem[];
  softwareRequests: any[];
}

function loadFallbackStore(): FallbackStore {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
        parsed.users = DEFAULT_USERS;
        saveFallbackStore(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading fallback store:', err);
  }

  // Default initial store
  const initialStore: FallbackStore = {
    users: DEFAULT_USERS,
    labs: INITIAL_LABS,
    reservations: INITIAL_RESERVATIONS,
    notifications: INITIAL_NOTIFICATIONS,
    softwareRequests: [],
  };

  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing initial fallback store:', err);
  }

  return initialStore;
}

function saveFallbackStore(store: FallbackStore) {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving fallback store:', err);
  }
}

let memoryStore: FallbackStore = loadFallbackStore();

/**
 * Initializes PostgreSQL Pool and creates schema
 */
export async function initDatabase(customUrl?: string): Promise<{ connected: boolean; message: string }> {
  const urlToUse = customUrl || connectionString;

  try {
    if (pool) {
      await pool.end().catch(() => {});
      pool = null;
    }

    if (urlToUse) {
      pool = new Pool({
        connectionString: urlToUse,
        ssl: urlToUse.includes('sslmode=require') || urlToUse.includes('render.com') || urlToUse.includes('neon.tech') || urlToUse.includes('supabase.co')
          ? { rejectUnauthorized: false }
          : false,
        connectionTimeoutMillis: 4000,
      });
    } else {
      pool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'labreserve',
        connectionTimeoutMillis: 4000,
      });
    }

    // Test connection with a simple query
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    isConnected = true;
    connectionError = null;

    // Create tables if they do not exist
    await createSchemaTables();

    // Seed initial data if tables are empty
    await seedInitialDataIfEmpty();

    console.log('✅ PostgreSQL connected and schema verified successfully.');
    return { connected: true, message: 'Conectado ao PostgreSQL com sucesso.' };
  } catch (err: any) {
    isConnected = false;
    const msg = connectionError || 'Falha ao conectar ao banco de dados PostgreSQL.';
    return { connected: false, message: msg };
  }
}

/**
 * Creates all tables required for LabReserve
 */
async function createSchemaTables() {
  if (!pool || !isConnected) return;

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS labs (
      id VARCHAR(100) PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      block VARCHAR(50) NOT NULL,
      floor VARCHAR(50) NOT NULL,
      room_number VARCHAR(20) NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 30,
      cpu VARCHAR(100),
      ram VARCHAR(50),
      storage VARCHAR(50),
      gpu VARCHAR(100),
      installed_software JSONB DEFAULT '[]'::jsonb,
      air_conditioned BOOLEAN DEFAULT true,
      projector VARCHAR(100),
      white_board BOOLEAN DEFAULT true,
      no_break BOOLEAN DEFAULT true,
      available_hours VARCHAR(100) DEFAULT '08:00 às 22:00',
      status VARCHAR(30) DEFAULT 'livre',
      image TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedule_slots (
      id VARCHAR(100) PRIMARY KEY,
      lab_id VARCHAR(100) REFERENCES labs(id) ON DELETE CASCADE,
      date VARCHAR(20) NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      reservation_id VARCHAR(100),
      subject VARCHAR(255) NOT NULL,
      professor_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id VARCHAR(100) PRIMARY KEY,
      protocol VARCHAR(50) NOT NULL UNIQUE,
      subject VARCHAR(255) NOT NULL,
      course VARCHAR(100),
      assigned_class VARCHAR(100),
      professor_name VARCHAR(255) NOT NULL,
      professor_id VARCHAR(100),
      siape VARCHAR(50),
      students_count INTEGER NOT NULL,
      date_str VARCHAR(20) NOT NULL,
      date_formatted VARCHAR(100) NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      duration_str VARCHAR(50),
      required_software JSONB DEFAULT '[]'::jsonb,
      extra_software TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'pendente',
      assigned_lab_id VARCHAR(100),
      assigned_lab_code VARCHAR(20),
      assigned_lab_name VARCHAR(255),
      assigned_location VARCHAR(255),
      total_stations INTEGER,
      admin_justification TEXT,
      reviewed_at TIMESTAMP WITH TIME ZONE,
      reviewed_by VARCHAR(255),
      requires_it_support BOOLEAN DEFAULT false,
      it_ticket JSONB,
      qr_code_text VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      timestamp VARCHAR(50) NOT NULL,
      read BOOLEAN DEFAULT false,
      type VARCHAR(30) DEFAULT 'info',
      target_role VARCHAR(30),
      reservation_id VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'professor',
      siape VARCHAR(50),
      department VARCHAR(255),
      institute VARCHAR(255),
      email VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS software_requests (
      id VARCHAR(100) PRIMARY KEY,
      lab_id VARCHAR(100) REFERENCES labs(id) ON DELETE SET NULL,
      software_name VARCHAR(255) NOT NULL,
      justification TEXT,
      priority VARCHAR(30) DEFAULT 'normal',
      status VARCHAR(30) DEFAULT 'em_andamento',
      ticket_code VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(schemaSql);
}

/**
 * Seeds initial demo data if tables are empty
 */
async function seedInitialDataIfEmpty() {
  if (!pool || !isConnected) return;

  const countRes = await pool.query('SELECT COUNT(*) as count FROM labs');
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    console.log('🌱 Seeding initial laboratories into PostgreSQL...');
    for (const lab of INITIAL_LABS) {
      await pool.query(
        `INSERT INTO labs (
          id, code, name, category, block, floor, room_number, capacity,
          cpu, ram, storage, gpu, installed_software, air_conditioned,
          projector, white_board, no_break, available_hours, status, image
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          lab.id,
          lab.code,
          lab.name,
          lab.category,
          lab.block,
          lab.floor,
          lab.roomNumber,
          lab.capacity,
          lab.cpu,
          lab.ram,
          lab.storage,
          lab.gpu || null,
          JSON.stringify(lab.installedSoftware),
          lab.airConditioned,
          lab.projector,
          lab.whiteBoard,
          lab.noBreak,
          lab.availableHours,
          lab.status,
          lab.image || null,
        ]
      );

      // Seed schedule slots
      if (lab.scheduleSlots && lab.scheduleSlots.length > 0) {
        for (const slot of lab.scheduleSlots) {
          await pool.query(
            `INSERT INTO schedule_slots (id, lab_id, date, start_time, end_time, reservation_id, subject, professor_name)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [slot.id, lab.id, slot.date, slot.startTime, slot.endTime, slot.reservationId, slot.subject, slot.professorName]
          );
        }
      }
    }
  }

  const resCount = await pool.query('SELECT COUNT(*) as count FROM reservations');
  if (parseInt(resCount.rows[0].count, 10) === 0) {
    console.log('🌱 Seeding initial reservations into PostgreSQL...');
    for (const r of INITIAL_RESERVATIONS) {
      await pool.query(
        `INSERT INTO reservations (
          id, protocol, subject, course, assigned_class, professor_name, professor_id, siape,
          students_count, date_str, date_formatted, start_time, end_time, duration_str,
          required_software, extra_software, status, assigned_lab_id, assigned_lab_code,
          assigned_lab_name, assigned_location, total_stations, admin_justification,
          reviewed_at, reviewed_by, requires_it_support, it_ticket, qr_code_text, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        )`,
        [
          r.id,
          r.protocol,
          r.subject,
          r.course,
          r.assignedClass,
          r.professorName,
          r.professorId,
          r.siape,
          r.studentsCount,
          r.dateStr,
          r.dateFormatted,
          r.startTime,
          r.endTime,
          r.durationStr,
          JSON.stringify(r.requiredSoftware),
          r.extraSoftware || null,
          r.status,
          r.assignedLabId || null,
          r.assignedLabCode || null,
          r.assignedLabName || null,
          r.assignedLocation || null,
          r.totalStations || null,
          r.adminJustification || null,
          r.reviewedAt || null,
          r.reviewedBy || null,
          r.requiresItSupport || false,
          r.itTicket ? JSON.stringify(r.itTicket) : null,
          r.qrCodeText,
          r.createdAt || new Date().toISOString(),
        ]
      );
    }
  }

  const notifCount = await pool.query('SELECT COUNT(*) as count FROM notifications');
  if (parseInt(notifCount.rows[0].count, 10) === 0) {
    console.log('🌱 Seeding initial notifications into PostgreSQL...');
    for (const n of INITIAL_NOTIFICATIONS) {
      await pool.query(
        `INSERT INTO notifications (id, title, description, timestamp, read, type, target_role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [n.id, n.title, n.description, n.timestamp, n.read, n.type, n.targetRole || null]
      );
    }
  }

  const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
  if (parseInt(usersCount.rows[0].count, 10) === 0) {
    console.log('🌱 Seeding default users into PostgreSQL...');
    for (const u of DEFAULT_USERS) {
      await pool.query(
        `INSERT INTO users (id, name, username, password, role, siape, department, institute, email, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [u.id, u.name, u.username, u.password || 'lab123', u.role, u.siape || null, u.department || null, u.institute || null, u.email || null, u.createdAt]
      );
    }
  }
}

// ----------------------------------------------------
// DATABASE ACCESS API (Reads & Writes to PostgreSQL with Fallback)
// ----------------------------------------------------

export async function getDbStatus() {
  let tableCounts = { labs: 0, reservations: 0, notifications: 0, users: 0 };

  if (pool && isConnected) {
    try {
      const l = await pool.query('SELECT COUNT(*) as count FROM labs');
      const r = await pool.query('SELECT COUNT(*) as count FROM reservations');
      const n = await pool.query('SELECT COUNT(*) as count FROM notifications');
      const u = await pool.query('SELECT COUNT(*) as count FROM users');
      tableCounts = {
        labs: parseInt(l.rows[0].count, 10),
        reservations: parseInt(r.rows[0].count, 10),
        notifications: parseInt(n.rows[0].count, 10),
        users: parseInt(u.rows[0].count, 10),
      };
    } catch {}
  } else {
    tableCounts = {
      labs: memoryStore.labs.length,
      reservations: memoryStore.reservations.length,
      notifications: memoryStore.notifications.length,
      users: (memoryStore.users || []).length,
    };
  }

  return {
    database: isConnected ? 'PostgreSQL' : 'JSON/In-Memory Resiliente',
    isConnected,
    error: connectionError,
    tableCounts,
  };
}

// LABS CRUD
export async function dbGetLabs(): Promise<Lab[]> {
  if (pool && isConnected) {
    try {
      const labsRes = await pool.query('SELECT * FROM labs ORDER BY code ASC');
      const slotsRes = await pool.query('SELECT * FROM schedule_slots ORDER BY date ASC, start_time ASC');

      const slotsByLab: Record<string, any[]> = {};
      for (const slot of slotsRes.rows) {
        if (!slotsByLab[slot.lab_id]) slotsByLab[slot.lab_id] = [];
        slotsByLab[slot.lab_id].push({
          id: slot.id,
          date: slot.date,
          startTime: slot.start_time,
          endTime: slot.end_time,
          reservationId: slot.reservation_id,
          subject: slot.subject,
          professorName: slot.professor_name,
        });
      }

      return labsRes.rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        category: row.category,
        block: row.block,
        floor: row.floor,
        roomNumber: row.room_number,
        capacity: row.capacity,
        cpu: row.cpu,
        ram: row.ram,
        storage: row.storage,
        gpu: row.gpu || undefined,
        installedSoftware: Array.isArray(row.installed_software) ? row.installed_software : [],
        airConditioned: row.air_conditioned,
        projector: row.projector,
        whiteBoard: row.white_board,
        noBreak: row.no_break,
        availableHours: row.available_hours,
        status: row.status,
        image: row.image || undefined,
        scheduleSlots: slotsByLab[row.id] || [],
      }));
    } catch (err) {
      console.error('Error querying labs from PG, falling back to local store:', err);
    }
  }

  return memoryStore.labs;
}

export async function dbSaveLab(lab: Lab): Promise<Lab> {
  if (pool && isConnected) {
    try {
      const exists = await pool.query('SELECT id FROM labs WHERE id = $1', [lab.id]);
      if (exists.rows.length > 0) {
        await pool.query(
          `UPDATE labs SET
            code = $2, name = $3, category = $4, block = $5, floor = $6, room_number = $7,
            capacity = $8, cpu = $9, ram = $10, storage = $11, gpu = $12, installed_software = $13,
            air_conditioned = $14, projector = $15, white_board = $16, no_break = $17,
            available_hours = $18, status = $19, image = $20
           WHERE id = $1`,
          [
            lab.id,
            lab.code,
            lab.name,
            lab.category,
            lab.block,
            lab.floor,
            lab.roomNumber,
            lab.capacity,
            lab.cpu,
            lab.ram,
            lab.storage,
            lab.gpu || null,
            JSON.stringify(lab.installedSoftware),
            lab.airConditioned,
            lab.projector,
            lab.whiteBoard,
            lab.noBreak,
            lab.availableHours,
            lab.status,
            lab.image || null,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO labs (
            id, code, name, category, block, floor, room_number, capacity,
            cpu, ram, storage, gpu, installed_software, air_conditioned,
            projector, white_board, no_break, available_hours, status, image
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
          [
            lab.id,
            lab.code,
            lab.name,
            lab.category,
            lab.block,
            lab.floor,
            lab.roomNumber,
            lab.capacity,
            lab.cpu,
            lab.ram,
            lab.storage,
            lab.gpu || null,
            JSON.stringify(lab.installedSoftware),
            lab.airConditioned,
            lab.projector,
            lab.whiteBoard,
            lab.noBreak,
            lab.availableHours,
            lab.status,
            lab.image || null,
          ]
        );
      }
    } catch (err) {
      console.error('Error saving lab in PG:', err);
    }
  }

  // Always keep memoryStore in sync
  const idx = memoryStore.labs.findIndex((l) => l.id === lab.id);
  if (idx >= 0) {
    memoryStore.labs[idx] = lab;
  } else {
    memoryStore.labs.unshift(lab);
  }
  saveFallbackStore(memoryStore);

  return lab;
}

export async function dbDeleteLab(labId: string): Promise<boolean> {
  if (pool && isConnected) {
    try {
      await pool.query('DELETE FROM labs WHERE id = $1', [labId]);
    } catch (err) {
      console.error('Error deleting lab from PG:', err);
    }
  }

  memoryStore.labs = memoryStore.labs.filter((l) => l.id !== labId);
  saveFallbackStore(memoryStore);
  return true;
}

// RESERVATIONS CRUD
export async function dbGetReservations(): Promise<Reservation[]> {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT * FROM reservations ORDER BY created_at DESC');
      return res.rows.map((row) => ({
        id: row.id,
        protocol: row.protocol,
        subject: row.subject,
        course: row.course,
        assignedClass: row.assigned_class,
        professorName: row.professor_name,
        professorId: row.professor_id,
        siape: row.siape,
        studentsCount: row.students_count,
        dateStr: row.date_str,
        dateFormatted: row.date_formatted,
        startTime: row.start_time,
        endTime: row.end_time,
        durationStr: row.duration_str,
        requiredSoftware: Array.isArray(row.required_software) ? row.required_software : [],
        extraSoftware: row.extra_software || undefined,
        status: row.status,
        assignedLabId: row.assigned_lab_id || undefined,
        assignedLabCode: row.assigned_lab_code || undefined,
        assignedLabName: row.assigned_lab_name || undefined,
        assignedLocation: row.assigned_location || undefined,
        totalStations: row.total_stations || undefined,
        adminJustification: row.admin_justification || undefined,
        reviewedAt: row.reviewed_at || undefined,
        reviewedBy: row.reviewed_by || undefined,
        requiresItSupport: row.requires_it_support,
        itTicket: row.it_ticket || undefined,
        qrCodeText: row.qr_code_text,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('Error querying reservations from PG:', err);
    }
  }

  return memoryStore.reservations;
}

export async function dbCreateReservation(reservation: Reservation): Promise<Reservation> {
  if (pool && isConnected) {
    try {
      await pool.query(
        `INSERT INTO reservations (
          id, protocol, subject, course, assigned_class, professor_name, professor_id, siape,
          students_count, date_str, date_formatted, start_time, end_time, duration_str,
          required_software, extra_software, status, assigned_lab_id, assigned_lab_code,
          assigned_lab_name, assigned_location, total_stations, admin_justification,
          reviewed_at, reviewed_by, requires_it_support, it_ticket, qr_code_text, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        )`,
        [
          reservation.id,
          reservation.protocol,
          reservation.subject,
          reservation.course,
          reservation.assignedClass,
          reservation.professorName,
          reservation.professorId,
          reservation.siape,
          reservation.studentsCount,
          reservation.dateStr,
          reservation.dateFormatted,
          reservation.startTime,
          reservation.endTime,
          reservation.durationStr,
          JSON.stringify(reservation.requiredSoftware),
          reservation.extraSoftware || null,
          reservation.status,
          reservation.assignedLabId || null,
          reservation.assignedLabCode || null,
          reservation.assignedLabName || null,
          reservation.assignedLocation || null,
          reservation.totalStations || null,
          reservation.adminJustification || null,
          reservation.reviewedAt || null,
          reservation.reviewedBy || null,
          reservation.requiresItSupport || false,
          reservation.itTicket ? JSON.stringify(reservation.itTicket) : null,
          reservation.qrCodeText,
          reservation.createdAt,
        ]
      );
    } catch (err) {
      console.error('Error inserting reservation into PG:', err);
    }
  }

  memoryStore.reservations.unshift(reservation);
  saveFallbackStore(memoryStore);

  return reservation;
}

export async function dbApproveReservation(
  resId: string,
  labId: string,
  adminNotes?: string
): Promise<{ reservation: Reservation; lab: Lab } | null> {
  const labs = await dbGetLabs();
  const targetLab = labs.find((l) => l.id === labId);
  if (!targetLab) return null;

  const reviewedAt = new Date().toISOString();
  const reviewedBy = 'Eng. Roberto Ramos (Admin DTI)';
  const qrCode = `LR-${Math.floor(1000 + Math.random() * 9000)}-${targetLab.code}`;

  if (pool && isConnected) {
    try {
      await pool.query(
        `UPDATE reservations SET
          status = 'confirmada',
          assigned_lab_id = $2,
          assigned_lab_code = $3,
          assigned_lab_name = $4,
          assigned_location = $5,
          total_stations = $6,
          admin_justification = $7,
          reviewed_by = $8,
          reviewed_at = $9,
          qr_code_text = $10
         WHERE id = $1`,
        [
          resId,
          targetLab.id,
          targetLab.code,
          targetLab.name,
          `${targetLab.block}, Sala ${targetLab.roomNumber}`,
          targetLab.capacity,
          adminNotes || null,
          reviewedBy,
          reviewedAt,
          qrCode,
        ]
      );

      // Fetch reservation details to create schedule slot
      const rRes = await pool.query('SELECT * FROM reservations WHERE id = $1', [resId]);
      if (rRes.rows.length > 0) {
        const r = rRes.rows[0];
        await pool.query(
          `INSERT INTO schedule_slots (id, lab_id, date, start_time, end_time, reservation_id, subject, professor_name)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [`slot-${Date.now()}`, targetLab.id, r.date_str, r.start_time, r.end_time, r.id, r.subject, r.professor_name]
        );
      }
    } catch (err) {
      console.error('Error approving reservation in PG:', err);
    }
  }

  // Update in memory store
  let updatedRes: Reservation | null = null;
  memoryStore.reservations = memoryStore.reservations.map((r) => {
    if (r.id === resId) {
      updatedRes = {
        ...r,
        status: 'confirmada',
        assignedLabId: targetLab.id,
        assignedLabCode: targetLab.code,
        assignedLabName: targetLab.name,
        assignedLocation: `${targetLab.block}, Sala ${targetLab.roomNumber}`,
        totalStations: targetLab.capacity,
        adminJustification: adminNotes || undefined,
        reviewedBy,
        reviewedAt,
        qrCodeText: qrCode,
      };
      return updatedRes;
    }
    return r;
  });

  // Add schedule slot in memory lab
  const labIndex = memoryStore.labs.findIndex((l) => l.id === labId);
  if (labIndex >= 0 && updatedRes) {
    const slots = memoryStore.labs[labIndex].scheduleSlots || [];
    slots.push({
      id: `slot-${Date.now()}`,
      date: (updatedRes as Reservation).dateStr,
      startTime: (updatedRes as Reservation).startTime,
      endTime: (updatedRes as Reservation).endTime,
      reservationId: resId,
      subject: (updatedRes as Reservation).subject,
      professorName: (updatedRes as Reservation).professorName,
    });
    memoryStore.labs[labIndex].scheduleSlots = slots;
  }

  saveFallbackStore(memoryStore);

  return updatedRes ? { reservation: updatedRes, lab: targetLab } : null;
}

export async function dbRejectReservation(resId: string, justification: string): Promise<Reservation | null> {
  const reviewedAt = new Date().toISOString();
  const reviewedBy = 'Eng. Roberto Ramos (Admin DTI)';

  if (pool && isConnected) {
    try {
      await pool.query(
        `UPDATE reservations SET
          status = 'rejeitada',
          admin_justification = $2,
          reviewed_by = $3,
          reviewed_at = $4
         WHERE id = $1`,
        [resId, justification, reviewedBy, reviewedAt]
      );
    } catch (err) {
      console.error('Error rejecting reservation in PG:', err);
    }
  }

  let updatedRes: Reservation | null = null;
  memoryStore.reservations = memoryStore.reservations.map((r) => {
    if (r.id === resId) {
      updatedRes = {
        ...r,
        status: 'rejeitada',
        adminJustification: justification,
        reviewedBy,
        reviewedAt,
      };
      return updatedRes;
    }
    return r;
  });

  saveFallbackStore(memoryStore);
  return updatedRes;
}

export async function dbDeleteReservation(resId: string): Promise<boolean> {
  if (pool && isConnected) {
    try {
      await pool.query('DELETE FROM schedule_slots WHERE reservation_id = $1', [resId]);
      await pool.query('DELETE FROM reservations WHERE id = $1', [resId]);
    } catch (err) {
      console.error('Error deleting reservation in PG:', err);
    }
  }

  memoryStore.reservations = memoryStore.reservations.filter((r) => r.id !== resId);
  // Also remove schedule slots from labs
  memoryStore.labs.forEach((l) => {
    if (l.scheduleSlots) {
      l.scheduleSlots = l.scheduleSlots.filter((s) => s.reservationId !== resId);
    }
  });

  saveFallbackStore(memoryStore);
  return true;
}

// NOTIFICATIONS CRUD
export async function dbGetNotifications(): Promise<NotificationItem[]> {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
      return res.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        timestamp: row.timestamp,
        read: row.read,
        type: row.type,
        targetRole: row.target_role || undefined,
        reservationId: row.reservation_id || undefined,
      }));
    } catch (err) {
      console.error('Error fetching notifications from PG:', err);
    }
  }

  return memoryStore.notifications;
}

export async function dbCreateNotification(notif: NotificationItem): Promise<NotificationItem> {
  if (pool && isConnected) {
    try {
      await pool.query(
        `INSERT INTO notifications (id, title, description, timestamp, read, type, target_role, reservation_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          notif.id,
          notif.title,
          notif.description,
          notif.timestamp,
          notif.read,
          notif.type,
          notif.targetRole || null,
          notif.reservationId || null,
        ]
      );
    } catch (err) {
      console.error('Error saving notification in PG:', err);
    }
  }

  memoryStore.notifications.unshift(notif);
  saveFallbackStore(memoryStore);
  return notif;
}

export async function dbMarkNotificationRead(id: string): Promise<boolean> {
  if (pool && isConnected) {
    try {
      await pool.query('UPDATE notifications SET read = true WHERE id = $1', [id]);
    } catch (err) {
      console.error('Error marking notification read in PG:', err);
    }
  }

  memoryStore.notifications = memoryStore.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveFallbackStore(memoryStore);
  return true;
}

export async function dbMarkAllNotificationsRead(): Promise<boolean> {
  if (pool && isConnected) {
    try {
      await pool.query('UPDATE notifications SET read = true');
    } catch (err) {
      console.error('Error marking all notifications read in PG:', err);
    }
  }

  memoryStore.notifications = memoryStore.notifications.map((n) => ({ ...n, read: true }));
  saveFallbackStore(memoryStore);
  return true;
}

export async function dbClearNotifications(): Promise<boolean> {
  if (pool && isConnected) {
    try {
      await pool.query('DELETE FROM notifications');
    } catch (err) {
      console.error('Error clearing notifications in PG:', err);
    }
  }

  memoryStore.notifications = [];
  saveFallbackStore(memoryStore);
  return true;
}

// SOFTWARE REQUESTS
export async function dbCreateSoftwareRequest(data: {
  labId: string;
  softwareName: string;
  justification: string;
  priority?: string;
}) {
  const id = `req-${Date.now()}`;
  const ticketCode = `#${Math.floor(4000 + Math.random() * 5000)}`;

  if (pool && isConnected) {
    try {
      await pool.query(
        `INSERT INTO software_requests (id, lab_id, software_name, justification, priority, status, ticket_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, data.labId, data.softwareName, data.justification, data.priority || 'normal', 'em_andamento', ticketCode]
      );
    } catch (err) {
      console.error('Error inserting software request in PG:', err);
    }
  }

  const reqItem = {
    id,
    labId: data.labId,
    softwareName: data.softwareName,
    justification: data.justification,
    priority: data.priority || 'normal',
    status: 'em_andamento',
    ticketCode,
    createdAt: new Date().toISOString(),
  };

  memoryStore.softwareRequests = memoryStore.softwareRequests || [];
  memoryStore.softwareRequests.unshift(reqItem);
  saveFallbackStore(memoryStore);

  return reqItem;
}

// ----------------------------------------------------
// USERS & AUTHENTICATION
// ----------------------------------------------------

export async function dbGetUsers(): Promise<User[]> {
  if (pool && isConnected) {
    try {
      const res = await pool.query(
        'SELECT id, name, username, role, siape, department, institute, email, created_at as "createdAt" FROM users ORDER BY created_at ASC'
      );
      if (res.rows.length > 0) {
        return res.rows;
      }
    } catch (err) {
      console.error('Error fetching users from PG:', err);
    }
  }

  // Ensure default users exist
  if (!memoryStore.users || memoryStore.users.length === 0) {
    memoryStore.users = DEFAULT_USERS;
    saveFallbackStore(memoryStore);
  }

  return (memoryStore.users || []).map((u) => {
    const { password, ...safeUser } = u;
    return safeUser as User;
  });
}

export async function dbGetUserByUsername(username: string): Promise<User | null> {
  const cleanUsername = username.trim().toLowerCase();

  if (pool && isConnected) {
    try {
      const res = await pool.query(
        'SELECT id, name, username, password, role, siape, department, institute, email, created_at as "createdAt" FROM users WHERE LOWER(username) = $1 LIMIT 1',
        [cleanUsername]
      );
      if (res.rows.length > 0) {
        return res.rows[0];
      }
    } catch (err) {
      console.error('Error fetching user by username from PG:', err);
    }
  }

  if (!memoryStore.users || memoryStore.users.length === 0) {
    memoryStore.users = DEFAULT_USERS;
    saveFallbackStore(memoryStore);
  }

  const found = (memoryStore.users || []).find((u) => u.username.toLowerCase() === cleanUsername);
  return found || null;
}

export async function dbCreateUser(userData: {
  name: string;
  username: string;
  password?: string;
  role?: 'professor' | 'admin';
  siape?: string;
  department?: string;
  institute?: string;
  email?: string;
}): Promise<User> {
  const cleanUsername = userData.username.trim().toLowerCase();
  const id = `usr-${Date.now()}`;
  const now = new Date().toISOString();
  const role = userData.role || 'professor';
  const password = userData.password || '123';

  const newUser: User = {
    id,
    name: userData.name.trim(),
    username: cleanUsername,
    password,
    role,
    siape: userData.siape?.trim() || `${Math.floor(100000 + Math.random() * 900000)}`,
    department: userData.department?.trim() || 'Departamento Acadêmico',
    institute: userData.institute?.trim() || 'ICET',
    email: userData.email?.trim() || `${cleanUsername}@universidade.edu.br`,
    createdAt: now,
  };

  if (pool && isConnected) {
    try {
      await pool.query(
        `INSERT INTO users (id, name, username, password, role, siape, department, institute, email, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [newUser.id, newUser.name, newUser.username, newUser.password, newUser.role, newUser.siape, newUser.department, newUser.institute, newUser.email, newUser.createdAt]
      );
    } catch (err) {
      console.error('Error inserting user into PG:', err);
    }
  }

  memoryStore.users = memoryStore.users || [];
  // check if exists and update or push
  const existingIdx = memoryStore.users.findIndex((u) => u.username.toLowerCase() === cleanUsername);
  if (existingIdx >= 0) {
    memoryStore.users[existingIdx] = newUser;
  } else {
    memoryStore.users.push(newUser);
  }
  saveFallbackStore(memoryStore);

  const { password: _, ...safeUser } = newUser;
  return safeUser as User;
}

export async function dbUpdateUser(id: string, updates: Partial<User>): Promise<User | null> {
  if (pool && isConnected) {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updates.name !== undefined) {
        fields.push(`name = $${idx++}`);
        values.push(updates.name.trim());
      }
      if (updates.username !== undefined) {
        fields.push(`username = $${idx++}`);
        values.push(updates.username.trim().toLowerCase());
      }
      if (updates.password !== undefined && updates.password.trim()) {
        fields.push(`password = $${idx++}`);
        values.push(updates.password.trim());
      }
      if (updates.role !== undefined) {
        fields.push(`role = $${idx++}`);
        values.push(updates.role);
      }
      if (updates.siape !== undefined) {
        fields.push(`siape = $${idx++}`);
        values.push(updates.siape.trim());
      }
      if (updates.department !== undefined) {
        fields.push(`department = $${idx++}`);
        values.push(updates.department.trim());
      }
      if (updates.institute !== undefined) {
        fields.push(`institute = $${idx++}`);
        values.push(updates.institute.trim());
      }
      if (updates.email !== undefined) {
        fields.push(`email = $${idx++}`);
        values.push(updates.email.trim());
      }

      if (fields.length > 0) {
        values.push(id);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, username, role, siape, department, institute, email, created_at as "createdAt"`;
        const res = await pool.query(query, values);
        if (res.rows.length > 0) {
          // Sync with memory
          const userIdx = (memoryStore.users || []).findIndex((u) => u.id === id);
          if (userIdx >= 0) {
            memoryStore.users[userIdx] = { ...memoryStore.users[userIdx], ...updates };
            saveFallbackStore(memoryStore);
          }
          return res.rows[0];
        }
      }
    } catch (err) {
      console.error('Error updating user in PG:', err);
    }
  }

  memoryStore.users = memoryStore.users || [];
  const userIdx = memoryStore.users.findIndex((u) => u.id === id);
  if (userIdx >= 0) {
    const existing = memoryStore.users[userIdx];
    const updated: User = {
      ...existing,
      ...updates,
      username: updates.username ? updates.username.trim().toLowerCase() : existing.username,
      password: updates.password && updates.password.trim() ? updates.password.trim() : existing.password,
    };
    memoryStore.users[userIdx] = updated;
    saveFallbackStore(memoryStore);

    const { password: _, ...safeUser } = updated;
    return safeUser as User;
  }
  return null;
}

export async function dbUpdateUserPassword(username: string, newPassword: string): Promise<boolean> {
  const cleanUsername = username.trim().toLowerCase();

  if (pool && isConnected) {
    try {
      await pool.query('UPDATE users SET password = $1 WHERE LOWER(username) = $2', [newPassword, cleanUsername]);
    } catch (err) {
      console.error('Error updating password in PG:', err);
    }
  }

  memoryStore.users = memoryStore.users || [];
  const idx = memoryStore.users.findIndex((u) => u.username.toLowerCase() === cleanUsername);
  if (idx >= 0) {
    memoryStore.users[idx].password = newPassword;
    saveFallbackStore(memoryStore);
    return true;
  }
  return false;
}

export async function dbDeleteUser(id: string): Promise<boolean> {
  if (pool && isConnected) {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
    } catch (err) {
      console.error('Error deleting user in PG:', err);
    }
  }

  memoryStore.users = (memoryStore.users || []).filter((u) => u.id !== id);
  saveFallbackStore(memoryStore);
  return true;
}
