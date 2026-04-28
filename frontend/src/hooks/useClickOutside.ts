import { useEffect } from 'react';

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handler();
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, handler]);
}
