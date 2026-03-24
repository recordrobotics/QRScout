import { useEffect } from 'react';

const CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes

export function useUpdateCheck() {
  useEffect(() => {
    if (import.meta.env.DEV) return;

    const checkUpdate = async () => {
      try {
        const url = `${import.meta.env.BASE_URL}version.json`.replace(
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
        const latestVersion = data.version;
        const currentVersion = localStorage.getItem('app_version');

        if (currentVersion && currentVersion !== latestVersion) {
          console.log('New version found:', latestVersion);
          localStorage.setItem('app_version', latestVersion);
          // Clear SW cache and reload
          if ('serviceWorker' in navigator) {
            const registrations =
              await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.update();
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
