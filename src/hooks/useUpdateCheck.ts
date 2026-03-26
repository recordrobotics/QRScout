import { useEffect } from 'react';

const CHECK_INTERVAL = 1000 * 60 * 1; // 1 minute

export function useUpdateCheck() {
  useEffect(() => {
    if (import.meta.env.DEV) return;

    const checkUpdate = async () => {
      try {
        const url = `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`.replace(
          /\/+/g,
          '/',
        );
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });
        if (!response.ok) return;

        const data = await response.json();
        const latestVersion = `${data.version}-${data.buildTime}`;
        const currentVersion = localStorage.getItem('app_version');

        if (currentVersion && currentVersion !== latestVersion) {
          console.log('New version found:', latestVersion);
          
          // Clear everything as requested: localStorage and Cookies
          localStorage.clear();
          localStorage.setItem('app_version', latestVersion);
          
          // Clear all cookies
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          }

          // Clear Service Worker cache and reload
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.update();
            }
            // Also unregister for a truly fresh start
            for (const registration of registrations) {
              await registration.unregister();
            }
          }
          window.location.reload();
        } else if (!currentVersion) {
          localStorage.setItem('app_version', latestVersion);
        }
      } catch (e) {
        console.error('Failed to check for updates:', e);
      }
    };

    const intervalId = setInterval(checkUpdate, CHECK_INTERVAL);
    checkUpdate(); // Initial check

    return () => clearInterval(intervalId);
  }, []);
}
