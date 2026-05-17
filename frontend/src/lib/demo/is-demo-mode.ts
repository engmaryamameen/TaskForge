/**
 * Portfolio / Vercel demo mode: frontend-only data via the demo API adapter.
 * Never use this to gate real production backend behavior — only UI fallbacks.
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}
