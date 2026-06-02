import axios from 'axios';
import axiosClient from '../../../api/axiosClient';
import { REGISTRATIONS } from '../../../api/endpoints';
import type { RegistrationResponse, RegistrationDetail } from '../../../types/event';

export async function fetchMyRegistrations(): Promise<RegistrationResponse[]> {
  try {
    const { data } = await axiosClient.get<RegistrationResponse[]>(REGISTRATIONS.MY_REGISTRATIONS);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      throw new Error('AUTH_REQUIRED');
    }
    throw new Error('No se pudieron cargar tus inscripciones.');
  }
}

export async function cancelRegistration(eventId: number): Promise<void> {
  try {
    await axiosClient.delete(REGISTRATIONS.CANCEL(eventId));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message as string | undefined;
      if (msg) throw new Error(msg);
    }
    throw new Error('No se pudo cancelar la inscripción. Intenta de nuevo.');
  }
}

export async function fetchEventRegistrants(eventId: number): Promise<RegistrationDetail[]> {
  try {
    const { data } = await axiosClient.get<RegistrationDetail[]>(REGISTRATIONS.BY_EVENT(eventId));
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) throw new Error('No tienes permiso para ver los inscritos de este evento.');
      if (error.response?.status === 404) throw new Error('Evento no encontrado.');
      const msg = error.response?.data?.message as string | undefined;
      if (msg) throw new Error(msg);
    }
    throw new Error('No se pudieron cargar los inscritos.');
  }
}

export async function downloadRegistrantsCsv(eventId: number, eventTitle: string): Promise<void> {
  const { data } = await axiosClient.get<Blob>(REGISTRATIONS.EXPORT_CSV(eventId), {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inscritos-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function registerForEvent(eventId: number): Promise<RegistrationResponse> {
  try {
    const { data } = await axiosClient.post<RegistrationResponse>(REGISTRATIONS.REGISTER, { eventId });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) throw new Error('Ya estás inscrito en este evento.');
      if (error.response?.status === 400) {
        const msg = error.response.data?.message as string | undefined;
        throw new Error(msg ?? 'No cumples los requisitos para este evento.');
      }
      if (error.response?.status === 403) throw new Error('Solo estudiantes pueden inscribirse.');
      const msg = error.response?.data?.message as string | undefined;
      if (msg) throw new Error(msg);
    }
    throw new Error('No se pudo completar la inscripción. Intenta de nuevo.');
  }
}
