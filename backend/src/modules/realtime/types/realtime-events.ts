/**
 * Prefixes of domain events that should be forwarded to WebSocket clients.
 * Uses prefix matching (not rigid array) for extensibility —
 * adding project.archived later requires no change here.
 */
export const REALTIME_EVENT_PREFIXES = [
  'task.',
  'project.',
  'member.',
  'subscription.',
] as const;

export function isRealtimeEvent(eventType: string): boolean {
  return REALTIME_EVENT_PREFIXES.some((prefix) =>
    eventType.startsWith(prefix),
  );
}
