'use client';

import { useEffect, useRef } from 'react';
import { isDemoMode } from '@/lib/demo/is-demo-mode';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { SocketEvents } from '@/lib/socket/events';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import type { RealtimeEvent, Task, ApiResponse } from '@/types';
import { taskKeys } from '@/features/tasks/hooks/useTasks';
import { projectKeys } from '@/features/projects/hooks/useProjects';
import { orgKeys } from '@/features/organizations/hooks/useOrganizations';

/**
 * Core realtime bridge: socket events → cache updates + notifications.
 *
 * Strategy:
 * - task.updated: targeted cache merge (instant) + invalidate (safety net)
 * - task.created/deleted, project/member events: invalidate only
 * - All events: also invalidate activity cache (activity is a derived view)
 * - Notifications: created for other users' actions only (skip self via actorId)
 * - Reconnect: org-scoped refetch to close data gaps
 *
 * Optimistic + socket collision safety:
 * Both optimistic updates and socket events converge on server truth via
 * invalidateQueries. Event deduplication prevents double processing.
 */
export function useSocketEvents() {
  const queryClient = useQueryClient();
  const hasConnectedBefore = useRef(false);

  useEffect(() => {
    if (isDemoMode()) return;

    const socket = getSocket();
    if (!socket) return;

    const seenEvents = new Set<string>();

    // --- Reconnect refetch ---
    function handleConnect() {
      if (hasConnectedBefore.current) {
        // Refetch stale data after reconnect — events during gap are lost
        queryClient.invalidateQueries({ queryKey: taskKeys.all });
        queryClient.invalidateQueries({ queryKey: projectKeys.all });
        queryClient.invalidateQueries({ queryKey: orgKeys.members });
        queryClient.invalidateQueries({ queryKey: ['activity'] });
      }
      hasConnectedBefore.current = true;
    }

    // --- Event handler ---
    function handleEvent(event: RealtimeEvent) {
      // Deduplicate: backend can re-deliver on reconnect
      if (seenEvents.has(event.eventId)) return;
      seenEvents.add(event.eventId);

      if (seenEvents.size > 500) {
        const entries = Array.from(seenEvents);
        entries.slice(0, 250).forEach((id) => seenEvents.delete(id));
      }

      const currentUserId = useAuthStore.getState().user?.id;

      switch (event.type) {
        case SocketEvents.TASK_UPDATED:
          // Targeted cache update for instant UI (same as optimistic pattern)
          if (event.data) {
            const taskData = event.data as Partial<Task> & { id?: string };
            const taskId = event.entityId || taskData.id;
            if (taskId) {
              queryClient.setQueriesData<ApiResponse<Task[]>>(
                { queryKey: taskKeys.all },
                (old) => {
                  if (!old?.data) return old;
                  return {
                    ...old,
                    data: old.data.map((t) => {
                      if (t.id !== taskId) return t;
                      const merged = { ...t, ...taskData };
                      // Timestamp guard: don't overwrite fresher data
                      if (taskData.updatedAt && t.updatedAt > taskData.updatedAt) return t;
                      return merged;
                    }),
                  };
                },
              );
            }
          }
          // Safety net: refetch from server
          queryClient.invalidateQueries({ queryKey: taskKeys.all });
          if (event.entityId) {
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(event.entityId) });
          }
          break;

        case SocketEvents.TASK_CREATED:
        case SocketEvents.TASK_DELETED:
          queryClient.invalidateQueries({ queryKey: taskKeys.all });
          if (event.entityId) {
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(event.entityId) });
          }
          break;

        case SocketEvents.PROJECT_CREATED:
        case SocketEvents.PROJECT_UPDATED:
        case SocketEvents.PROJECT_DELETED:
          queryClient.invalidateQueries({ queryKey: projectKeys.all });
          if (event.entityId) {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(event.entityId) });
          }
          break;

        case SocketEvents.MEMBER_INVITED:
        case SocketEvents.MEMBER_JOINED:
          queryClient.invalidateQueries({ queryKey: orgKeys.members });
          break;

        case SocketEvents.SUBSCRIPTION_CREATED:
        case SocketEvents.SUBSCRIPTION_UPDATED:
        case SocketEvents.SUBSCRIPTION_CANCELED:
          break;
      }

      // Activity is a derived view of all domain events
      queryClient.invalidateQueries({ queryKey: ['activity'] });

      // Create notification for other users' actions
      if (event.actorId && event.actorId !== currentUserId) {
        const message = getEventMessage(event);
        if (message) {
          useNotificationStore.getState().addNotification({
            id: event.eventId,
            type: event.type,
            message,
            entityId: event.entityId,
            entityType: getEntityType(event.type),
            actorId: event.actorId,
            createdAt: event.timestamp,
            read: false,
          });
        }
      }
    }

    function handleNotification(payload: {
      id: string;
      type: string;
      message: string;
      entityType?: string;
      entityId?: string;
      actorId?: string;
      createdAt: string;
    }) {
      useNotificationStore.getState().addNotification({
        id: payload.id,
        type: payload.type,
        message: payload.message,
        entityId: payload.entityId ?? '',
        entityType: (payload.entityType as 'task' | 'project' | 'organization') ?? undefined,
        actorId: payload.actorId ?? '',
        createdAt: payload.createdAt,
        read: false,
      });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    }

    socket.on('connect', handleConnect);
    socket.on('notification', handleNotification);
    const eventTypes = Object.values(SocketEvents);
    eventTypes.forEach((eventType) => {
      socket.on(eventType, handleEvent);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('notification', handleNotification);
      eventTypes.forEach((eventType) => {
        socket.off(eventType, handleEvent);
      });
    };
  }, [queryClient]);
}

function getEntityType(eventType: string): 'task' | 'project' | 'organization' | undefined {
  if (eventType.startsWith('task.')) return 'task';
  if (eventType.startsWith('project.')) return 'project';
  if (eventType.startsWith('member.')) return 'organization';
  return undefined;
}

function getEventMessage(event: RealtimeEvent): string | null {
  switch (event.type) {
    case SocketEvents.TASK_CREATED:
      return 'New task created';
    case SocketEvents.TASK_UPDATED:
      return 'Task updated';
    case SocketEvents.TASK_DELETED:
      return 'Task deleted';
    case SocketEvents.PROJECT_CREATED:
      return 'New project created';
    case SocketEvents.PROJECT_UPDATED:
      return 'Project updated';
    case SocketEvents.PROJECT_DELETED:
      return 'Project deleted';
    case SocketEvents.MEMBER_JOINED:
      return 'New member joined';
    case SocketEvents.MEMBER_INVITED:
      return 'New member invited';
    default:
      return null;
  }
}
