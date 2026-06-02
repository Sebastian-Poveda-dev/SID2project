import { useState, useEffect, useCallback } from 'react';
import type { EventSummary } from '../../../types/event';
import { fetchEvents, type EventFilters } from '../services/eventService';

interface UseEventsResult {
  events: EventSummary[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useEvents(filters?: EventFilters): UseEventsResult {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(await fetchEvents(filters));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.eventType, filters?.status, filters?.startDate, filters?.endDate]);

  useEffect(() => { load(); }, [load]);

  return { events, loading, error, retry: load };
}
