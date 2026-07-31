import { useCallback } from "react";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

function getLenis(): Lenis {
  if (!lenisInstance) {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenisInstance?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
  return lenisInstance;
}

export function useScrollTo() {
  const scrollTo = useCallback(
    (target: string | HTMLElement, options?: { offset?: number; duration?: number }) => {
      const lenis = getLenis();
      const element =
        typeof target === "string" ? document.querySelector(target) : target;

      if (element) {
        lenis.scrollTo(element as HTMLElement, {
          offset: options?.offset ?? 0,
          duration: options?.duration ?? 1.2,
        });
      }
    },
    [],
  );

  const scrollToTop = useCallback(() => {
    getLenis().scrollTo(0, { duration: 1 });
  }, []);

  return { scrollTo, scrollToTop };
}
