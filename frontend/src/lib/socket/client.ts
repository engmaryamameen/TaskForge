import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().accessToken;
  if (!token) {
    throw new Error('Cannot connect socket without auth token');
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
  });

  socket.on('connect', () => {
    console.debug('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.debug('[Socket] Disconnected:', reason);
  });

  socket.on('auth_error', (data: { message: string }) => {
    console.error('[Socket] Auth error:', data.message);
    disconnectSocket();
  });

  socket.on('reconnect', () => {
    // Re-join org room on reconnect
    const orgId = useAuthStore.getState().currentOrganizationId;
    if (orgId) {
      joinOrgRoom(orgId);
    }
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function joinOrgRoom(orgId: string): void {
  socket?.emit('join-org', { orgId });
}

export function leaveOrgRoom(orgId: string): void {
  socket?.emit('leave-org', { orgId });
}
