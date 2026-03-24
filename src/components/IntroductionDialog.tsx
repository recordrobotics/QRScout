import { useEffect, useState } from 'react';
import packageJson from '../../package.json';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export function IntroductionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'intro' | 'update' | null>(null);

  useEffect(() => {
    try {
      const currentVersion = packageJson.version;
      const storedVersion = localStorage.getItem('app_version');

      if (!storedVersion) {
        // First time opening the app
        setMode('intro');
        setIsOpen(true);
      } else if (storedVersion !== currentVersion) {
        // App has been updated
        setMode('update');
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error checking app version:', error);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem('app_version', packageJson.version);
    } catch (error) {
      console.error('Error saving app version to localStorage:', error);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-rhr-ns text-primary">
            {mode === 'intro' ? 'Welcome to QRScout!' : 'QRScout Updated!'}
          </DialogTitle>
          <DialogDescription className="text-base pt-4">
            {mode === 'intro' ? (
              <div className="flex flex-col gap-3">
                <p>
                  QRScout is a dynamic, offline-first scouting application
                  designed for competitive robotics.
                </p>
                <p>
                  As you track matches, your data is converted directly into a
                  secure QR code OR synced directly to the cloud.
                </p>
                <p>
                  This data can be managed instantly inside your
                  team's master spreadsheet—no spotty stadium Wi-Fi required!
                </p>
                <p className="font-semibold text-secondary-foreground dark:text-neutral-300">
                  Ready to start scouting?
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p>
                  We've updated QRScout to version{' '}
                  <strong>{packageJson.version}</strong>!
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Added <strong>Cloud Sync</strong> to instantly upload your 
                    offline match queue to Google Sheets.
                  </li>
                  <li>
                    Robust <strong>Offline Queuing</strong> utilizing IndexedDB 
                    for data protection during connectivity loss.
                  </li>
                  <li>
                    Enhanced UI with a dedicated <strong>Sync Button</strong> 
                    and real-time status indicators.
                  </li>
                  <li>
                    Updated <strong>2026 Season Config</strong> with optimized 
                    field layout for the latest challenge.
                  </li>
                </ul>
                <p className="font-semibold text-secondary-foreground">
                  Thanks for using QRScout. Happy scouting!
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            onClick={handleDismiss}
            className="w-full sm:w-auto text-lg py-6"
          >
            {mode === 'intro' ? "Let's Go!" : 'Got It!'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
