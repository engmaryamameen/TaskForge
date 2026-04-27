'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { SocketEvents } from '@/lib/socket/events';
import type { RealtimeEvent } from '@/types';
import { taskKeys } from '@/features/tasks/hooks/useTasks';
import { projectKeys } from '@/features/projects/hooks/useProjects';
import { orgKeys } from '@/features/organizations/hooks/useOrganizations';

/**
 * Listens to socket events and invalidates the relevant React Query caches.
 * This is the bridge: socket → cache invalidation → automatic UI update.
 *
 * Rule: Socket updates invalidate cache (source of truth reconciliation).
 * Never directly mutate UI state from socket events.
 */
export function useSocketEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const seenEvents = new Set<string>();

    function handleEvent(event: RealtimeEvent) {
      // Deduplicate: backend can re-deliver on reconnect
      if (seenEvents.has(event.eventId)) return;
      seenEvents.add(event.eventId);

      // Trim dedup set to prevent memory growth
      if (seenEvents.size > 500) {
        const entries = Array.from(seenEvents);
        entries.slice(0, 250).forEach((id) => seenEvents.delete(id));
      }

      switch (event.type) {
        case SocketEvents.TASK_CREATED:
        case SocketEvents.TASK_UPDATED:
        case SocketEvents.TASK_DELETED:
          queryClient.invalidateQueries({ queryKey: taskKeys.all });
          if (event.entityId) {
            queryClient.invalidateQueries({
              queryKey: taskKeys.detail(event.entityId),
            });
          }
          break;

        case SocketEvents.PROJECT_CREATED:
        case SocketEvents.PROJECT_UPDATED:
        case SocketEvents.PROJECT_DELETED:
          queryClient.invalidateQueries({ queryKey: projectKeys.all });
          if (event.entityId) {
            queryClient.invalidateQueries({
              queryKey: projectKeys.detail(event.entityId),
            });
          }
          break;

        case SocketEvents.MEMBER_INVITED:
        case SocketEvents.MEMBER_JOINED:
          queryClient.invalidateQueries({ queryKey: orgKeys.members });
          break;

        case SocketEvents.SUBSCRIPTION_CREATED:
        case SocketEvents.SUBSCRIPTION_UPDATED:
        case SocketEvents.SUBSCRIPTION_CANCELED:
          // Billing queries can be added when the billing feature is built
          break;
      }
    }

    // Subscribe to all realtime event types
    const eventTypes = Object.values(SocketEvents);
    eventTypes.forEach((eventType) => {
      socket.on(eventType, handleEvent);
    });

    return () => {
      eventTypes.forEach((eventType) => {
        socket.off(eventType, handleEvent);
      });
    };
  }, [queryClient]);
}
