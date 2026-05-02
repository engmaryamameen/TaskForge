/**
 * Active state for Tasks sidebar links that use query params.
 * Board view = /tasks with no status, assignee, or due filter.
 */
const FILTER_KEYS = ['status', 'assignee', 'due'] as const;

export function matchTasksSubNav(
  pathname: string,
  searchParams: URLSearchParams,
  subHref: string,
): boolean {
  const base = new URL(subHref, 'http://local.example');
  if (pathname !== base.pathname) return false;

  if (!base.search || base.search === '') {
    return !FILTER_KEYS.some((k) => {
      const v = searchParams.get(k);
      return v !== null && v !== '';
    });
  }

  for (const key of base.searchParams.keys()) {
    if (searchParams.get(key) !== base.searchParams.get(key)) {
      return false;
    }
  }
  return true;
}
