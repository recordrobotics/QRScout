import { get, set, update } from 'idb-keyval';

export interface MatchDataPayload {
  teamNumber: number;
  matchNumber: number;
  scouter: string;
  timestamp: number;
  payload: Record<string, any>; // The combined state data 
}

const SYNC_QUEUE_KEY = 'qrscout_sync_queue';

export async function queueMatchForSync(match: MatchDataPayload) {
  try {
    await update(SYNC_QUEUE_KEY, (val) => {
      const queue = (val as MatchDataPayload[]) || [];
      return [...queue, match];
    });
    console.log("Match queued for sync!", match);
  } catch (error) {
    console.error("Failed to queue match", error);
  }
}

export async function getQueuedMatches(): Promise<MatchDataPayload[]> {
  const data = await get(SYNC_QUEUE_KEY);
  return (data as MatchDataPayload[]) || [];
}

export async function clearQueuedMatches() {
  await set(SYNC_QUEUE_KEY, []);
}
