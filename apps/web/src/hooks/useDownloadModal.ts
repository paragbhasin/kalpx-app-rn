import { useState, useRef, useCallback } from "react";

const STORAGE_KEY = "kalpx.download.modal.lastShown";
const MODAL_INTERVAL = 24 * 60 * 60 * 1000;
const MODAL_DELAY = import.meta.env.DEV ? 3 * 1000 : 60 * 1000;

function shouldShow(): boolean {
  try {
    const last = localStorage.getItem(STORAGE_KEY);
    if (!last) return true;
    return Date.now() - Number(last) > MODAL_INTERVAL;
  } catch {
    return false;
  }
}

export function useDownloadModal() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => setVisible(false), []);

  const openAppStore = useCallback(() => {
    window.open("https://apps.apple.com/us/app/kalpx/id6755144623", "_blank");
  }, []);

  const openPlayStore = useCallback(() => {
    window.open(
      "https://play.google.com/store/apps/details?id=com.kalpx.app",
      "_blank"
    );
  }, []);

  const schedule = useCallback(() => {
    if (window.location.pathname.includes("/creator")) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!shouldShow()) return;

    timerRef.current = setTimeout(() => {
      if (window.location.pathname.includes("/creator")) return;
      setVisible(true);
      try {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch {}
      timerRef.current = null;
    }, MODAL_DELAY);
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { visible, close, openAppStore, openPlayStore, schedule, cancel };
}
