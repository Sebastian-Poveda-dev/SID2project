import axios from 'axios';
import axiosClient from '../../../api/axiosClient';
import { EVENTS } from '../../../api/endpoints';
import type { EventSummary, EventDetail } from '../../../types/event';

export async function fetchEventById(id: number): Promise<EventDetail> {
  try {
    const { data } = await axiosClient.get<EventDetail>(EVENTS.DETAIL(id));
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('AUTH_REQUIRED');
      }
      if (error.response?.status === 404) {
        throw new Error('Evento no encontrado.');
      }
      const msg = error.response?.data?.message as string | undefined;
      if (msg) throw new Error(msg);
    }
    throw new Error('No se pudo cargar el evento. Intenta de nuevo.');
  }
}

export async function fetchMyEvents(): Promise<EventSummary[]> {
  try {
    const { data } = await axiosClient.get<EventSummary[]>(EVENTS.MY_EVENTS);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('AUTH_REQUIRED');
      }
    }
    throw new Error('No se pudieron cargar tus eventos.');
  }
}

export async function createEvent(payload: import('../../../types/event').CreateEventRequest): Promise<import('../../../types/event').EventDetail> {
  try {
    const { data } = await axiosClient.post(EVENTS.CREATE, payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message as string | undefined;
      if (msg) throw new Error(msg);
    }
    throw new Error('No se pudo crear el evento. Intenta de nuevo.');
  }
}

export async function deleteEvent(id: number): Promise<void> {
  try {
    await axiosClient.delete(EVENTS.DELETE(id));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message as string | undefined;
      if (msg) throw new Error(msg);
    }
    throw new Error('No se pudo eliminar el evento.');
  }
}

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
