import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Trap focus inside a dialog while open, handle Escape to close,
 * and return focus to the previously focused element on unmount.
 *
 * Pass `active=false` to disable (e.g. dialog closed).
 */
export function useDialogA11y(
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  active = true,
) {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    if (!node) return;

    previousFocus.current = document.activeElement as HTMLElement | null;

    // Focus first focusable element inside dialog
    const first = node.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = node?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusables || focusables.length === 0) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus.current?.focus?.();
    };
    // Intentionally exclude containerRef/onClose — they're stable per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
