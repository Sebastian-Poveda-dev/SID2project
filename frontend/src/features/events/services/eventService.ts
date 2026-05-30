import axios from 'axios';
import axiosClient from '../../../api/axiosClient';
import { EVENTS } from '../../../api/endpoints';
import type { EventSummary } from '../../../types/event';

export async function fetchEvents(): Promise<EventSummary[]> {
  try {
    const { data } = await axiosClient.get<EventSummary[]>(EVENTS.LIST);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('AUTH_REQUIRED');
      }
      if (!error.response) {
        throw new Error('Error de conexión. Verifica tu acceso a internet.');
      }
      const msg = error.response.data?.message as string | undefined;
      if (msg) throw new Error(msg);
    }
    throw new Error('No se pudieron cargar los eventos. Intenta de nuevo.');
  }
}
