/**
 * Shared rhythm for auth screens (desktop + mobile).
 * - Title → subtitle: 12px (mt-3)
 * - Header block → form / alerts: 28px (mb-7)
 * - Field groups: 12px (flex flex-col gap-3)
 * - Footer links: 20px below primary actions (mt-5)
 */
export const AUTH_PAGE_TITLE =
  'text-left text-[1.625rem] font-bold leading-tight tracking-tight text-neutral-900 sm:text-[1.75rem]';

export const AUTH_PAGE_SUBTITLE = 'mt-3 text-left text-[15px] leading-relaxed text-neutral-500';

/** Wraps h1 + subtitle (+ optional banner). Space before form/errors. */
export const AUTH_HEADER_SECTION = 'mb-7 text-left';

export const AUTH_FORM_STACK = 'flex flex-col gap-2';

/** Primary button row is inside AUTH_FORM_STACK; links sit closer with mt-5. */
export const AUTH_FOOTER_LINKS = 'mt-5 text-left text-sm text-neutral-500';

/** Vertical stack for paired CTAs (verify / check-email) — mobile dock */
export const AUTH_ACTION_STACK = 'flex flex-col gap-3';

/** Same actions in normal desktop flow */
export const AUTH_ACTION_STACK_DESKTOP = 'hidden flex-col gap-3 lg:flex lg:flex-col';

/** Alerts above the form align with header→form gap */
export const AUTH_ALERT_MARGIN = 'mb-7';

/** Secondary headings (verify states, errors) */
export const AUTH_PAGE_TITLE_SECONDARY =
  'text-left text-xl font-bold leading-snug tracking-tight text-neutral-900 sm:text-2xl';

/** Mobile: scrollable column — reserve space for fixed primary dock */
export const AUTH_MOBILE_SCROLL_COLUMN =
  'flex flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain pb-[calc(7.25rem+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] lg:flex-none lg:overflow-visible lg:pb-0';

/** Mobile: fixed primary action bar (Sign in, Continue, etc.) — hidden on lg where inline button is used */
export const AUTH_MOBILE_PRIMARY_DOCK =
  'fixed bottom-0 left-0 right-0 z-10 border-t border-neutral-100 bg-white/95 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] lg:hidden';

export const AUTH_MOBILE_DOCK_INNER = 'mx-auto w-full max-w-[430px]';

/** Desktop-only primary submit (paired with dock duplicate on mobile) */
export const AUTH_DESKTOP_SUBMIT =
  'mt-5 hidden min-h-[48px] w-full text-[15px] lg:inline-flex lg:w-full';
