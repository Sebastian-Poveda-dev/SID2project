import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CalendarDays, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { registerUser } from '../services/auth';

/* ── Validation schema ──────────────────────────────────────────────────── */

const schema = z
  .object({
    username: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(50, 'Máximo 50 caracteres')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Solo letras, números, guiones y puntos'),
    institutionalStudentId: z
      .string()
      .min(1, 'El código estudiantil es requerido')
      .max(15, 'Máximo 15 caracteres'),
    institutionalEmail: z
      .string()
      .email('Ingresa un correo válido')
      .max(100, 'Máximo 100 caracteres'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .max(255, 'Máximo 255 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

/* ── Section label ──────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
      {children}
    </p>
  );
}

/* ── Alert helpers ──────────────────────────────────────────────────────── */

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function SuccessAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      setServerError(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _confirmPassword, ...payload } = data;
      const authResponse = await registerUser(payload);

      /* Auto-login after successful registration */
      login(authResponse.token, {
        username: authResponse.username,
        role: authResponse.role,
      });
      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo…');
      setTimeout(() => navigate('/events', { replace: true }), 1200);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'No se pudo completar el registro.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-md">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Crear cuenta en UniPlan</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Ingresa tus datos institucionales</p>
          </div>
        </div>

        {/* Card */}
        <Card padding="lg" className="shadow-modal">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>

            {/* Alerts */}
            {serverError && <ErrorAlert message={serverError} />}
            {successMessage && <SuccessAlert message={successMessage} />}

            {/* ── Información estudiantil ── */}
            <div className="flex flex-col gap-4">
              <SectionLabel>Información estudiantil</SectionLabel>

              <Input
                {...register('username')}
                label="Nombre de usuario"
                placeholder="ej. maria_garcia"
                autoComplete="username"
                autoFocus
                hint="Solo letras, números, guiones y puntos"
                error={errors.username?.message}
              />

              <Input
                {...register('institutionalStudentId')}
                label="Código estudiantil"
                placeholder="ej. 20241234"
                autoComplete="off"
                error={errors.institutionalStudentId?.message}
              />

              <Input
                {...register('institutionalEmail')}
                label="Correo institucional"
                type="email"
                placeholder="usuario@universidad.edu.co"
                autoComplete="email"
                error={errors.institutionalEmail?.message}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-100" />

            {/* ── Seguridad ── */}
            <div className="flex flex-col gap-4">
              <SectionLabel>Contraseña</SectionLabel>

              <Input
                {...register('password')}
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                error={errors.password?.message}
                rightAddon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <Input
                {...register('confirmPassword')}
                label="Confirmar contraseña"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                rightAddon={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!!successMessage}
              className="w-full"
            >
              Crear cuenta
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <p className="mt-5 text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
