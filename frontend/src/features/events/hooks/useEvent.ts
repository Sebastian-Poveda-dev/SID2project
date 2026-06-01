import { useState, useEffect, useCallback } from 'react';
import type { EventDetail } from '../../../types/event';
import { fetchEventById } from '../services/eventService';

interface UseEventResult {
  event: EventDetail | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useEvent(id: number | undefined): UseEventResult {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEventById(id);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el evento.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { event, loading, error, retry: load };
}
