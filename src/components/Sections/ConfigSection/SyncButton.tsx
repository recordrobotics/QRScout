import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CloudUpload } from 'lucide-react';
import { getQueuedMatches, clearQueuedMatches } from '../../../util/idb';

export function SyncButton() {
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const refreshQueue = async () => {
    try {
      const matches = await getQueuedMatches();
      setQueueCount(matches.length);
    } catch {
      setQueueCount(0);
    }
  };

  useEffect(() => {
    refreshQueue();
    // Poll every 5 seconds to catch newly saved matches
    const interval = setInterval(refreshQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (queueCount === 0) return;
    
    setIsSyncing(true);
    setError(null);

    try {
      const matches = await getQueuedMatches();
      
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches })
      });

      const result = await res.json();
      
      if (res.ok && result.success) {
        await clearQueuedMatches();
        setQueueCount(0);
      } else {
        setError(result.error || 'Failed to sync. Server returned an error.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to sync server.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[200px]">
      <Button
        variant={queueCount > 0 ? "default" : "secondary"}
        onClick={handleSync}
        disabled={isSyncing || queueCount === 0}
        className="text-xs sm:text-sm w-full"
      >
        <CloudUpload className="h-5 w-5 flex-shrink-0 mr-2" />
        <span className="overflow-hidden text-ellipsis">
          {isSyncing ? 'Syncing...' : `Sync ${queueCount} Match${queueCount !== 1 ? 'es' : ''}`}
        </span>
      </Button>
      {error && (
        <span className="text-red-500 text-xs mt-1 text-center font-bold">
          {error}
        </span>
      )}
    </div>
  );
}
