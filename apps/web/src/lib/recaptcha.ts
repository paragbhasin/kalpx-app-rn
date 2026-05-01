const DEV_RECAPTCHA_TOKEN = 'dev-bypass-token';
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

async function waitForGrecaptcha(maxWaitMs = 8000): Promise<any> {
  const step = 100;
  for (let waited = 0; waited < maxWaitMs; waited += step) {
    const gr = (window as any).grecaptcha;
    if (gr) return gr;
    await new Promise((r) => setTimeout(r, step));
  }
  return null;
}

export async function getRecaptchaToken(action: string): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) return DEV_RECAPTCHA_TOKEN;
  try {
    const gr = await waitForGrecaptcha();
    if (!gr) return DEV_RECAPTCHA_TOKEN;
    return await new Promise<string>((resolve, reject) => {
      gr.ready(() => gr.execute(RECAPTCHA_SITE_KEY, { action }).then(resolve).catch(reject));
    });
  } catch {
    return DEV_RECAPTCHA_TOKEN;
  }
}
