import axios from 'axios';
import axiosClient from '../../../api/axiosClient';
import { STATISTICS } from '../../../api/endpoints';
import type {
  EventStatistics,
  StatisticsSummary,
  EventTypeStatistics,
  OrganizerPerformance,
} from '../../../types/statistics';
import type { EventSummary } from '../../../types/event';

function extractMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return 'No tienes permiso para ver estos datos.';
    const msg = error.response?.data?.message as string | undefined;
    if (msg) return msg;
  }
  return '';
}

export async function fetchStatsByEvent(eventId: number): Promise<EventStatistics> {
  try {
    const { data } = await axiosClient.get<EventStatistics>(STATISTICS.BY_EVENT(eventId));
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404)
      throw new Error('No se encontraron estadísticas para este evento.');
    throw new Error(extractMessage(error) || 'No se pudieron cargar las estadísticas.');
  }
}

export async function fetchPopularEvents(): Promise<EventSummary[]> {
  try {
    const { data } = await axiosClient.get<EventSummary[]>(STATISTICS.POPULAR_EVENTS);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error) || 'No se pudieron cargar los eventos populares.');
  }
}

export async function fetchOccupancyReport(): Promise<EventStatistics[]> {
  try {
    const { data } = await axiosClient.get<EventStatistics[]>(STATISTICS.OCCUPANCY);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error) || 'No se pudo cargar el reporte de ocupación.');
  }
}

export async function fetchSummary(): Promise<StatisticsSummary> {
  try {
    const { data } = await axiosClient.get<StatisticsSummary>(STATISTICS.SUMMARY);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error) || 'No se pudo cargar el resumen.');
  }
}

export async function fetchByEventType(): Promise<EventTypeStatistics[]> {
  try {
    const { data } = await axiosClient.get<EventTypeStatistics[]>(STATISTICS.BY_TYPE);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error) || 'No se pudieron cargar las estadísticas por tipo.');
  }
}

export async function fetchOrganizerPerformance(): Promise<OrganizerPerformance[]> {
  try {
    const { data } = await axiosClient.get<OrganizerPerformance[]>(STATISTICS.ORGANIZERS);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error) || 'No se pudo cargar el rendimiento de organizadores.');
  }
}
