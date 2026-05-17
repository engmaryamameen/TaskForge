/**
 * Inline script injected into <head> before React hydrates.
 * Reads the saved theme preference from localStorage and sets
 * data-theme on <html> synchronously so there is no flash of
 * wrong theme on page load.
 */
export const themeScript = `
(function(){
  try {
    var p = localStorage.getItem('taskforge-theme');
    var t = (p === 'dark' || p === 'light')
      ? p
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
`;
