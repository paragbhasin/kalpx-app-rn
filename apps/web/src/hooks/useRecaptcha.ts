import { useEffect } from 'react';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
const SCRIPT_ID = 'recaptcha-script';

export function useRecaptcha() {
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.getElementById(SCRIPT_ID)?.remove();
      document.querySelector('.grecaptcha-badge')?.remove();
      // Clean up the grecaptcha global so it reloads fresh next visit
      delete (window as any).grecaptcha;
    };
  }, []);
}
