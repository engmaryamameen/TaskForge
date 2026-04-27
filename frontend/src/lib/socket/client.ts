import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;
let currentOrgId: string | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

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
    if (currentOrgId) {
      joinOrgRoom(currentOrgId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.debug('[Socket] Disconnected:', reason);
  });

  socket.on('auth_error', (data: { message: string }) => {
    console.error('[Socket] Auth error:', data.message);
    disconnectSocket();
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
    if (err.message?.includes('unauthorized') || err.message?.includes('jwt')) {
      disconnectSocket();
    }
  });

  return socket;
}

export function updateToken(token: string): void {
  if (!socket) return;
  socket.auth = { token };
  socket.disconnect().connect();
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  currentOrgId = null;
}

export function joinOrgRoom(orgId: string): void {
  currentOrgId = orgId;
  socket?.emit('join-org', { orgId });
}

export function leaveOrgRoom(orgId: string): void {
  if (currentOrgId === orgId) {
    currentOrgId = null;
  }
  socket?.emit('leave-org', { orgId });
}
