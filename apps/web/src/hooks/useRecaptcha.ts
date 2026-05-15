import { useEffect } from 'react';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
const SCRIPT_ID = 'recaptcha-script';

export function useRecaptcha() {
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    document.body.classList.add('recaptcha-active');
    return () => {
      document.body.classList.remove('recaptcha-active');
    };
  }, []);
}
