import { useEffect, useState } from "react";

type ScrollChromeState = {
  isScrollingDown: boolean;
  shouldHideChrome: boolean;
};

const MOBILE_QUERY = "(max-width: 767px)";
const MIN_SCROLL_DELTA = 8;
const HIDE_AFTER_PX = 72;

export function useScrollDirection(): ScrollChromeState {
  const [state, setState] = useState<ScrollChromeState>({
    isScrollingDown: false,
    shouldHideChrome: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(MOBILE_QUERY);
    let lastY = Math.max(window.scrollY, 0);
    let rafId = 0;

    const update = () => {
      rafId = 0;

      if (!media.matches) {
        setState((current) =>
          current.shouldHideChrome || current.isScrollingDown
            ? { isScrollingDown: false, shouldHideChrome: false }
            : current,
        );
        lastY = Math.max(window.scrollY, 0);
        return;
      }

      const nextY = Math.max(window.scrollY, 0);
      const delta = nextY - lastY;

      if (Math.abs(delta) < MIN_SCROLL_DELTA) return;

      const isScrollingDown = delta > 0;
      const shouldHideChrome = isScrollingDown && nextY > HIDE_AFTER_PX;

      setState((current) =>
        current.isScrollingDown === isScrollingDown &&
        current.shouldHideChrome === shouldHideChrome
          ? current
          : { isScrollingDown, shouldHideChrome },
      );

      lastY = nextY;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    const onMediaChange = () => {
      lastY = Math.max(window.scrollY, 0);
      setState({ isScrollingDown: false, shouldHideChrome: false });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    if (media.addEventListener) {
      media.addEventListener("change", onMediaChange);
    } else {
      media.addListener(onMediaChange);
    }
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (media.removeEventListener) {
        media.removeEventListener("change", onMediaChange);
      } else {
        media.removeListener(onMediaChange);
      }
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return state;
}
