import { useState, useEffect, useCallback } from 'react';
import type { EventSummary } from '../../../types/event';
import { fetchEvents } from '../services/eventService';

interface UseEventsResult {
  events: EventSummary[];
  loading: boolean;
  /** 'AUTH_REQUIRED' is a special sentinel — page handles it separately */
  error: string | null;
  retry: () => void;
}

export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { events, loading, error, retry: load };
}
