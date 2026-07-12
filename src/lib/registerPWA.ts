const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari exposes navigator.standalone outside the standard type defs.
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/';
    const swUrl = new URL(`${base.replace(/\/$/, '')}/sw.js`, window.location.origin).toString();

    navigator.serviceWorker
      .register(swUrl, { scope: base })
      .then((registration) => {
        if (!isLocalhost) return;
        console.info('[CoffeeMind AI] Service worker registered', registration.scope);
      })
      .catch((error) => {
        if (!isLocalhost) return;
        console.warn('[CoffeeMind AI] Service worker registration failed', error);
      });
  });
}
