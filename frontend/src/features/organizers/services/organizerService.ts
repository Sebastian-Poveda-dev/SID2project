import axios from 'axios';
import axiosClient from '../../../api/axiosClient';
import { ORGANIZERS } from '../../../api/endpoints';

export type OrganizerType = 'FACULTY_MEMBER' | 'INSTRUCTOR' | 'STUDENT_LEADER' | 'WELLNESS_STAFF';

export interface ActivateOrganizerRequest {
  organizerType: OrganizerType;
  // STUDENT_LEADER — references existing user
  userId?: number;
  // FACULTY_MEMBER / INSTRUCTOR / WELLNESS_STAFF — new user
  institutionalEmployeeId?: string;
  institutionalEmail?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  temporaryPassword?: string;
  // FACULTY_MEMBER / INSTRUCTOR
  facultyCode?: number;
  department?: string;
  specializationArea?: string;
  // STUDENT_LEADER
  academicProgramCode?: number;
  semester?: string;
  studentGroup?: string;
  // WELLNESS_STAFF
  administrativeAreaCode?: number;
  jobTitle?: string;
}

export interface OrganizerResponse {
  id: number;
  username: string;
  institutionalId: string;
  organizerType: OrganizerType;
  enabled: boolean;
}

export async function activateOrganizer(payload: ActivateOrganizerRequest): Promise<OrganizerResponse> {
  try {
    const { data } = await axiosClient.post<OrganizerResponse>(ORGANIZERS.ACTIVATE, payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message as string | undefined;
      if (msg) throw new Error(msg);
      if (error.response?.status === 409) throw new Error('El usuario ya tiene un perfil de organizador.');
      if (error.response?.status === 404) throw new Error('Usuario no encontrado.');
    }
    throw new Error('No se pudo activar el organizador. Intenta de nuevo.');
  }
}
