/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { ReservationWizard } from './components/ReservationWizard';
import { LabsDirectoryScreen } from './components/LabsDirectoryScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { AdminRequestsScreen } from './components/admin/AdminRequestsScreen';
import { AdminRoomsCrudScreen } from './components/admin/AdminRoomsCrudScreen';
import { AdminUsersScreen } from './components/admin/AdminUsersScreen';
import { DatabaseStatusModal } from './components/admin/DatabaseStatusModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { LoginScreen } from './components/LoginScreen';
import { QrAccessModal } from './components/QrAccessModal';
import { SoftwareRequestModal } from './components/SoftwareRequestModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { ProfileModal } from './components/ProfileModal';
import {
  INITIAL_LABS,
  INITIAL_RESERVATIONS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { Lab, Reservation, NotificationItem, User } from './types';
import {
  apiGetHealth,
  apiGetLabs,
  apiSaveLab,
  apiDeleteLab,
  apiGetReservations,
  apiCreateReservation,
  apiApproveReservation,
  apiRejectReservation,
  apiDeleteReservation,
  apiGetNotifications,
  apiMarkAllNotificationsRead,
  apiClearNotifications,
  apiSubmitSoftwareRequest,
} from './services/api';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('labreserve_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (!currentUser) return 'inicio';
    return currentUser.role === 'admin' ? 'admin-pedidos' : 'inicio';
  });

  // Database Connection Status from backend
  const [dbStatus, setDbStatus] = useState<{
    database: string;
    isConnected: boolean;
    error: string | null;
    tableCounts: {
      labs: number;
      reservations: number;
      notifications: number;
      users?: number;
    };
  } | null>(null);

  // Labs Catalog State
  const [labs, setLabs] = useState<Lab[]>(() => {
    const saved = localStorage.getItem('labreserve_labs_v2');
    return saved ? JSON.parse(saved) : INITIAL_LABS;
  });

  // Reservations State
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('labreserve_reservations_v2');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('labreserve_notifications_v2');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Modals & Drawers
  const [qrModalReservation, setQrModalReservation] = useState<Reservation | null>(null);
  const [softwareRequestModalOpen, setSoftwareRequestModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  // Ticket viewing
  const [viewingTicketReservation, setViewingTicketReservation] = useState<Reservation | null>(null);

  // Initial Data Sync from Backend
  const refreshBackendData = useCallback(async () => {
    try {
      const health = await apiGetHealth().catch(() => null);
      if (health) {
        setDbStatus({
          database: health.database,
          isConnected: health.isConnected,
          error: health.error,
          tableCounts: health.tableCounts,
        });
      }

      const [remoteLabs, remoteReservations, remoteNotifications] = await Promise.all([
        apiGetLabs().catch(() => null),
        apiGetReservations().catch(() => null),
        apiGetNotifications().catch(() => null),
      ]);

      if (remoteLabs && remoteLabs.length > 0) {
        setLabs(remoteLabs);
      }
      if (remoteReservations && remoteReservations.length > 0) {
        setReservations(remoteReservations);
      }
      if (remoteNotifications && remoteNotifications.length > 0) {
        setNotifications(remoteNotifications);
      }
    } catch (err) {
      console.warn('Backend sync attempted with local fallback:', err);
    }
  }, []);

  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  // Sync cache with local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('labreserve_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('labreserve_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('labreserve_reservations_v2', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('labreserve_labs_v2', JSON.stringify(labs));
  }, [labs]);

  useEffect(() => {
    localStorage.setItem('labreserve_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentTab('admin-pedidos');
    } else {
      setCurrentTab('inicio');
    }
    setViewingTicketReservation(null);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setViewingTicketReservation(null);
    localStorage.removeItem('labreserve_auth_user');
  };

  // Professor creates a room request (without choosing room)
  const handleAddNewReservation = async (newRes: Reservation) => {
    // Optimistic local update
    setReservations((prev) => [newRes, ...prev]);

    try {
      await apiCreateReservation(newRes);
      await refreshBackendData();
    } catch (err) {
      console.error('API create reservation error:', err);
    }
  };

  // Admin approves reservation and allocates specific room
  const handleApproveReservation = async (resId: string, labId: string, adminNotes?: string) => {
    const targetLab = labs.find((l) => l.id === labId);
    if (!targetLab) return;

    // Optimistic local update
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === resId) {
          return {
            ...r,
            status: 'confirmada',
            assignedLabId: targetLab.id,
            assignedLabCode: targetLab.code,
            assignedLabName: targetLab.name,
            assignedLocation: `${targetLab.block}, Sala ${targetLab.roomNumber}`,
            totalStations: targetLab.capacity,
            adminJustification: adminNotes || undefined,
            reviewedBy: currentUser?.name || 'Administrador DTI',
            reviewedAt: new Date().toISOString(),
            qrCodeText: `LR-${Math.floor(1000 + Math.random() * 9000)}-${targetLab.code}`,
          };
        }
        return r;
      })
    );

    try {
      await apiApproveReservation(resId, labId, adminNotes);
      await refreshBackendData();
    } catch (err) {
      console.error('API approve reservation error:', err);
    }
  };

  // Admin rejects reservation with mandatory justification
  const handleRejectReservation = async (resId: string, justification: string) => {
    // Optimistic local update
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === resId) {
          return {
            ...r,
            status: 'rejeitada',
            adminJustification: justification,
            reviewedBy: currentUser?.name || 'Administrador DTI',
            reviewedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    try {
      await apiRejectReservation(resId, justification);
      await refreshBackendData();
    } catch (err) {
      console.error('API reject reservation error:', err);
    }
  };

  // Admin CRUD: Save Lab
  const handleSaveLab = async (savedLab: Lab) => {
    // Optimistic local update
    setLabs((prev) => {
      const exists = prev.some((l) => l.id === savedLab.id);
      if (exists) {
        return prev.map((l) => (l.id === savedLab.id ? savedLab : l));
      }
      return [savedLab, ...prev];
    });

    try {
      await apiSaveLab(savedLab);
      await refreshBackendData();
    } catch (err) {
      console.error('API save lab error:', err);
    }
  };

  // Admin CRUD: Delete Lab
  const handleDeleteLab = async (labId: string) => {
    setLabs((prev) => prev.filter((l) => l.id !== labId));

    try {
      await apiDeleteLab(labId);
      await refreshBackendData();
    } catch (err) {
      console.error('API delete lab error:', err);
    }
  };

  // Professor cancels reservation
  const handleCancelReservation = async (resId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== resId));

    try {
      await apiDeleteReservation(resId);
      await refreshBackendData();
    } catch (err) {
      console.error('API cancel reservation error:', err);
    }
  };

  // Software request submission
  const handleSoftwareRequestSubmitted = async (data: {
    labId?: string;
    softwareName: string;
    justification: string;
    priority?: string;
  }) => {
    try {
      await apiSubmitSoftwareRequest({
        labId: data.labId || 'lab-geral',
        softwareName: data.softwareName,
        justification: data.justification,
        priority: data.priority,
      });
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Novo Chamado de Software`,
        description: `Software "${data.softwareName}" solicitado com justificativa: "${data.justification.slice(0, 50)}..."`,
        timestamp: 'Agora',
        read: false,
        type: 'info',
        targetRole: 'admin',
      };
      setNotifications((prev) => [newNotif, ...prev]);
      await refreshBackendData();
    } catch (err) {
      console.error('Error submitting software request:', err);
    }
  };

  // View ticket action
  const handleViewTicketFromAnywhere = (res: Reservation) => {
    setViewingTicketReservation(res);
    setCurrentTab('nova-reserva');
  };

  const handleBack = () => {
    if (viewingTicketReservation) {
      setViewingTicketReservation(null);
      setCurrentTab(currentUser?.role === 'admin' ? 'admin-pedidos' : 'inicio');
      return;
    }
    setCurrentTab(currentUser?.role === 'admin' ? 'admin-pedidos' : 'inicio');
  };

  // If not authenticated, render LoginScreen!
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const currentRole = currentUser.role;

  // Filter reservations:
  // - If Professor: ONLY show reservations requested by this professor!
  // - If Admin: Show all reservations for comprehensive campus moderation
  const visibleReservations = currentRole === 'professor'
    ? reservations.filter((r) => {
        if (r.professorId && r.professorId === currentUser.id) return true;
        if (r.professorName && currentUser.name && r.professorName.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
        if (currentUser.siape && r.siape === currentUser.siape) return true;
        // For default demo user 'prof.andre' match 'André'
        if (currentUser.username === 'prof.andre' && r.professorName.toLowerCase().includes('andré')) return true;
        return false;
      })
    : reservations;

  const getHeaderSubtitle = () => {
    if (currentRole === 'admin') {
      switch (currentTab) {
        case 'admin-pedidos':
          return 'Moderar Pedidos de Salas';
        case 'admin-salas':
          return 'Gerenciar Salas (CRUD)';
        case 'admin-usuarios':
          return 'Gerenciar Usuários & Professores';
        case 'historico':
          return 'Histórico Geral de Reservas';
        default:
          return 'Administração DTI';
      }
    }
    switch (currentTab) {
      case 'inicio':
        return 'Minhas Aulas & Salas';
      case 'nova-reserva':
        return 'Fazer Pedido de Sala';
      case 'laboratorios':
        return 'Grade de Salas';
      case 'historico':
        return 'Minhas Reservas';
      default:
        return 'Laboratórios';
    }
  };

  const relevantNotifications = notifications.filter(
    (n) => !n.targetRole || n.targetRole === currentRole
  );
  const unreadCount = relevantNotifications.filter((n) => !n.read).length;
  const pendingRequestsCount = reservations.filter((r) => r.status === 'pendente').length;

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen selection:bg-primary selection:text-white">
      {/* Top Header */}
      <Header
        subtitle={getHeaderSubtitle()}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChangePassword={() => setChangePasswordModalOpen(true)}
        showBack={currentTab !== 'inicio' && currentTab !== 'admin-pedidos' || viewingTicketReservation !== null}
        onBack={handleBack}
        onOpenNotifications={() => setNotificationsDrawerOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenDbModal={() => setDbModalOpen(true)}
        isDbConnected={!!dbStatus?.isConnected}
        unreadCount={unreadCount}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setViewingTicketReservation(null);
          setCurrentTab(tab);
        }}
      />

      {/* Main Content Area: Responsive container up to max-w-7xl on desktop */}
      <main className="flex-1 flex flex-col relative w-full pt-16 bg-surface max-w-7xl mx-auto min-h-screen">
        {/* PROFESSOR SCREENS */}
        {currentRole === 'professor' && (
          <>
            {currentTab === 'inicio' && (
              <HomeScreen
                currentUser={currentUser}
                reservations={visibleReservations}
                onStartReservation={() => {
                  setViewingTicketReservation(null);
                  setCurrentTab('nova-reserva');
                }}
                onOpenSoftwareRequest={() => setSoftwareRequestModalOpen(true)}
                onViewReservationTicket={handleViewTicketFromAnywhere}
                onViewAllHistory={() => setCurrentTab('historico')}
              />
            )}

            {currentTab === 'nova-reserva' && (
              <div className="max-w-2xl mx-auto w-full">
                <ReservationWizard
                  key={viewingTicketReservation ? viewingTicketReservation.id : 'wizard-active'}
                  currentUser={currentUser}
                  activeReservationForTicket={viewingTicketReservation}
                  onFinishReservation={handleAddNewReservation}
                  onCancel={() => {
                    setViewingTicketReservation(null);
                    setCurrentTab('inicio');
                  }}
                />
              </div>
            )}

            {currentTab === 'historico' && (
              <HistoryScreen
                reservations={visibleReservations}
                onViewTicket={handleViewTicketFromAnywhere}
                onOpenQrModal={(res) => setQrModalReservation(res)}
                onCancelReservation={handleCancelReservation}
                onStartNewReservation={() => {
                  setViewingTicketReservation(null);
                  setCurrentTab('nova-reserva');
                }}
              />
            )}
          </>
        )}

        {/* ADMINISTRATOR SCREENS */}
        {currentRole === 'admin' && (
          <>
            {currentTab === 'admin-pedidos' && (
              <AdminRequestsScreen
                reservations={reservations}
                labs={labs}
                onApproveReservation={handleApproveReservation}
                onRejectReservation={handleRejectReservation}
                onViewTicket={handleViewTicketFromAnywhere}
              />
            )}

            {currentTab === 'admin-salas' && (
              <AdminRoomsCrudScreen
                labs={labs}
                onSaveLab={handleSaveLab}
                onDeleteLab={handleDeleteLab}
              />
            )}

            {currentTab === 'admin-usuarios' && (
              <AdminUsersScreen currentUser={currentUser} />
            )}

            {currentTab === 'historico' && (
              <HistoryScreen
                reservations={reservations}
                onViewTicket={handleViewTicketFromAnywhere}
                onOpenQrModal={(res) => setQrModalReservation(res)}
                onCancelReservation={handleCancelReservation}
                onStartNewReservation={() => setCurrentTab('admin-pedidos')}
              />
            )}

            {/* If viewing a ticket in admin mode */}
            {currentTab === 'nova-reserva' && (
              <div className="max-w-2xl mx-auto w-full">
                <ReservationWizard
                  key={viewingTicketReservation ? viewingTicketReservation.id : 'ticket-admin'}
                  currentUser={currentUser}
                  activeReservationForTicket={viewingTicketReservation}
                  onFinishReservation={handleAddNewReservation}
                  onCancel={() => {
                    setViewingTicketReservation(null);
                    setCurrentTab('admin-pedidos');
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom Navigation (Mobile Only) */}
      <BottomNav
        currentTab={currentTab}
        currentRole={currentRole}
        pendingRequestsCount={pendingRequestsCount}
        onSelectTab={(tab) => {
          setViewingTicketReservation(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Auxiliary Modals & Drawers */}
      <QrAccessModal
        isOpen={qrModalReservation !== null}
        onClose={() => setQrModalReservation(null)}
        reservation={qrModalReservation}
      />

      <SoftwareRequestModal
        isOpen={softwareRequestModalOpen}
        onClose={() => setSoftwareRequestModalOpen(false)}
        onRequestSubmitted={handleSoftwareRequestSubmitted}
      />

      <NotificationsDrawer
        isOpen={notificationsDrawerOpen}
        onClose={() => setNotificationsDrawerOpen(false)}
        notifications={relevantNotifications}
        onMarkAllAsRead={async () => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          await apiMarkAllNotificationsRead().catch(() => {});
        }}
        onClearNotifications={async () => {
          setNotifications([]);
          await apiClearNotifications().catch(() => {});
        }}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onOpenChangePassword={() => setChangePasswordModalOpen(true)}
        onLogout={handleLogout}
        activeCount={visibleReservations.filter((r) => r.status === 'confirmada').length}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Database Connection Inspector Modal */}
      <DatabaseStatusModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
        dbStatus={dbStatus}
        onRefresh={refreshBackendData}
      />
    </div>
  );
}
