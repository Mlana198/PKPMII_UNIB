/**
 * Leadership utility for storing Ketua and Sekretaris names used in official PDF header.
 * Data is persisted in localStorage under the key `pmii_leadership`.
 * If not present, default values are used.
 */
export interface Leadership {
  ketua: string;
  sekretaris: string;
}

const STORAGE_KEY = 'pmii_leadership';
const DEFAULT_LEADERSHIP: Leadership = {
  ketua: 'M. Rofiul Anam',
  sekretaris: 'Ahmad Wildan Zainur R',
};

/** Get current leadership data. Returns defaults if not set. */
export function getLeadership(): Leadership {
  if (typeof window === 'undefined') {
    return DEFAULT_LEADERSHIP;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Leadership;
      // Ensure both fields exist
      if (parsed.ketua && parsed.sekretaris) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse leadership from localStorage', e);
  }
  return DEFAULT_LEADERSHIP;
}

/** Persist leadership data. */
export function setLeadership(data: Leadership): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to store leadership to localStorage', e);
  }
}
