import { useLayoutEffect, useState, type RefObject } from 'react';

export type PopoverPlacement = 'top' | 'bottom';

const DEFAULT_POPOVER_HEIGHT = 320;

export function usePopoverPlacement(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
): PopoverPlacement {
  const [placement, setPlacement] = useState<PopoverPlacement>('bottom');

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const popoverHeight = popoverRef.current?.offsetHeight ?? DEFAULT_POPOVER_HEIGHT;
      const gap = 4;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (spaceBelow < popoverHeight + gap && spaceAbove > spaceBelow) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
    };

    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, triggerRef, popoverRef]);

  return placement;
}
