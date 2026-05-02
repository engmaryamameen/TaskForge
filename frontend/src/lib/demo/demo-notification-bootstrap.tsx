'use client';

/**
 * Seeds the in-app notification dropdown for portfolio demo — demo-only.
 * Real deployments rely on WebSocket-delivered notifications into the same store.
 */
import { useEffect, useRef } from 'react';
import { isDemoMode } from '@/lib/demo/is-demo-mode';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore, type AppNotification } from '@/store/notification.store';
import { DEMO_IDS } from '@/lib/demo/demo-ids';

function demoRelativeHours(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

function buildDemoUiNotifications(): AppNotification[] {
  const orgId = DEMO_IDS.org;
  const jordan = DEMO_IDS.teammates.jordan;
  const sam = DEMO_IDS.teammates.sam;
  const priya = DEMO_IDS.teammates.priya;
  const marcus = DEMO_IDS.teammates.marcus;
  const riley = DEMO_IDS.teammates.riley;
  const elena = DEMO_IDS.teammates.elena;

  return [
    {
      id: 'demo-notif-1',
      type: 'task_assigned',
      message: 'Jordan Lee assigned you to Beta signup flow',
      entityType: 'task',
      entityId: 'demo-task-beta-signup',
      actorId: jordan,
      createdAt: demoRelativeHours(2),
      read: false,
    },
    {
      id: 'demo-notif-2',
      type: 'task_updated',
      message: 'Jordan moved Design system audit to In progress',
      entityType: 'task',
      entityId: 'demo-task-design-audit',
      actorId: jordan,
      createdAt: demoRelativeHours(8),
      read: false,
    },
    {
      id: 'demo-notif-4',
      type: 'task_assigned',
      message: 'Sam Rivera assigned you to review CMS migration dry run',
      entityType: 'task',
      entityId: 'demo-task-cms-migration',
      actorId: sam,
      createdAt: demoRelativeHours(5),
      read: false,
    },
    {
      id: 'demo-notif-5',
      type: 'task_updated',
      message: 'Priya Shah commented on Per-tenant rate limits',
      entityType: 'task',
      entityId: 'demo-task-api-rate-limit',
      actorId: priya,
      createdAt: demoRelativeHours(1),
      read: false,
    },
    {
      id: 'demo-notif-8',
      type: 'task_updated',
      message: 'Priya Shah updated APNs & FCM credentials rotation',
      entityType: 'task',
      entityId: 'demo-task-push-cert',
      actorId: priya,
      createdAt: demoRelativeHours(6),
      read: false,
    },
    {
      id: 'demo-notif-11',
      type: 'task_assigned',
      message: 'Riley Nguyen requested review on Support macro refresh',
      entityType: 'task',
      entityId: 'demo-task-ops-macros',
      actorId: riley,
      createdAt: demoRelativeHours(3),
      read: false,
    },
    {
      id: 'demo-notif-12',
      type: 'task_updated',
      message: 'Jordan updated Semantic color tokens (dark mode)',
      entityType: 'task',
      entityId: 'demo-task-ds-tokens',
      actorId: jordan,
      createdAt: demoRelativeHours(4),
      read: false,
    },
    {
      id: 'demo-notif-3',
      type: 'member_joined',
      message: 'Sam Rivera joined Acme Product Team',
      entityType: 'organization',
      entityId: orgId,
      actorId: sam,
      createdAt: demoRelativeHours(72),
      read: true,
    },
    {
      id: 'demo-notif-6',
      type: 'task_assigned',
      message: 'Marcus Wright added you as watcher on Experiment #142',
      entityType: 'task',
      entityId: 'demo-task-grw-experiment-hero',
      actorId: marcus,
      createdAt: demoRelativeHours(28),
      read: true,
    },
    {
      id: 'demo-notif-7',
      type: 'member_joined',
      message: 'Priya Shah joined Acme Product Team',
      entityType: 'organization',
      entityId: orgId,
      actorId: priya,
      createdAt: demoRelativeHours(120),
      read: true,
    },
    {
      id: 'demo-notif-9',
      type: 'task_assigned',
      message: 'Elena Volkov assigned you to Admin action audit log UI',
      entityType: 'task',
      entityId: 'demo-task-ops-admin-audit',
      actorId: elena,
      createdAt: demoRelativeHours(36),
      read: true,
    },
    {
      id: 'demo-notif-10',
      type: 'task_updated',
      message: 'OpenAPI 3.1 publish pipeline moved to In progress',
      entityType: 'task',
      entityId: 'demo-task-api-openapi',
      actorId: priya,
      createdAt: demoRelativeHours(48),
      read: true,
    },
  ];
}

export function DemoNotificationBootstrap() {
  const status = useAuthStore((s) => s.status);
  const applied = useRef(false);

  useEffect(() => {
    if (!isDemoMode() || status !== 'authenticated') return;
    if (applied.current) return;
    applied.current = true;

    const rows = buildDemoUiNotifications();
    useNotificationStore.setState({
      notifications: rows,
      unreadCount: rows.filter((r) => !r.read).length,
    });
  }, [status]);

  return null;
}
