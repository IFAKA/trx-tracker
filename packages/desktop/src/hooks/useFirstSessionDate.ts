import { useState, useEffect } from 'react';
import { getFirstSessionDate } from '../lib/storage';

export function useFirstSessionDate(): string | null {
  const [firstSession, setFirstSession] = useState<string | null>(null);

  useEffect(() => {
    getFirstSessionDate().then(setFirstSession);
  }, []);

  return firstSession;
}
