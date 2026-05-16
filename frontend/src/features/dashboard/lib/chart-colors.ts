/**
 * Shared chart color tokens — references the CSS design tokens from globals.css.
 *
 * Recharts requires raw hex values (it renders to SVG, not DOM that can resolve
 * CSS vars). We keep a single source of truth here so every chart stays in sync
 * with the design system. When a token changes in globals.css, update the
 * corresponding hex here.
 */

/* ── core palette (mirrors @theme in globals.css) ── */
export const CHART_COLORS = {
  primary:      '#0C5FD9', // --color-primary-600
  primarySoft:  '#6B9AFF', // --color-primary-300
  success:      '#059669', // --color-success-600
  warning:      '#F59E0B', // --color-warning-500
  danger:       '#DC2626', // --color-danger-600

  /* neutrals used for grids, axes, fallbacks */
  grid:         '#E2E8F0', // --color-neutral-200
  axisLabel:    '#94A3B8', // --color-neutral-400
  axisLabelDark:'#64748B', // --color-neutral-500
  empty:        '#E2E8F0', // --color-neutral-200
  fallback:     '#64748B', // --color-neutral-500
} as const;

/* ── per-status colors (used by donut, bar, and status badges) ── */
export const STATUS_COLORS: Record<string, string> = {
  todo:        CHART_COLORS.primary,
  in_progress: CHART_COLORS.warning,
  done:        CHART_COLORS.success,
};
