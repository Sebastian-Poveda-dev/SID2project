import axios from 'axios';
import axiosClient from '../api/axiosClient';
import { AUTH } from '../api/endpoints';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

/* ── Error message extraction ───────────────────────────────────────────── */

function extractMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message as string | undefined;
    if (msg) return msg;

    if (!error.response) {
      return 'Error de conexión. Verifica tu acceso a internet.';
    }

    switch (error.response.status) {
      case 400: return 'Los datos enviados son inválidos.';
      case 401: return 'Credenciales incorrectas. Intenta de nuevo.';
      case 403: return 'No tienes permiso para realizar esta acción.';
      case 409: return 'El usuario o correo ya se encuentra registrado.';
      case 500: return 'Error interno del servidor. Intenta más tarde.';
    }
  }
  return fallback;
}

/* ── Auth API calls ─────────────────────────────────────────────────────── */

export async function loginUser(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const { data } = await axiosClient.post<AuthResponse>(AUTH.LOGIN, credentials);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, 'No se pudo iniciar sesión.'));
  }
}

export async function registerUser(payload: RegisterRequest): Promise<AuthResponse> {
  try {
    const { data } = await axiosClient.post<AuthResponse>(AUTH.REGISTER, payload);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, 'No se pudo completar el registro.'));
  }
}
