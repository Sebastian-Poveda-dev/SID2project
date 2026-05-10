import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, CalendarDays, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../services/auth';

/* ── Validation schema ──────────────────────────────────────────────────── */

const schema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type FormValues = z.infer<typeof schema>;

/* ── Session-expired banner ─────────────────────────────────────────────── */

function SessionExpiredAlert() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>Tu sesión ha expirado. Por favor inicia sesión de nuevo.</span>
    </div>
  );
}

/* ── Error alert ────────────────────────────────────────────────────────── */

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isExpired = (location.state as { reason?: string } | null)?.reason === 'expired';
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/events';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      setServerError(null);
      const authResponse = await loginUser(data);
      login(authResponse.token, { username: authResponse.username, role: authResponse.role });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-md">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Bienvenido a UniPlan</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Inicia sesión para continuar</p>
          </div>
        </div>

        {/* Card */}
        <Card padding="lg" className="shadow-modal">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

            {/* Session expired notice */}
            {isExpired && !serverError && <SessionExpiredAlert />}

            {/* Server error */}
            {serverError && <ErrorAlert message={serverError} />}

            {/* Username */}
            <Input
              {...register('username')}
              label="Nombre de usuario"
              placeholder="tu_usuario"
              autoComplete="username"
              autoFocus
              error={errors.username?.message}
            />

            {/* Password */}
            <Input
              {...register('password')}
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            {/* Submit */}
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-1"
              size="md"
            >
              Iniciar sesión
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <p className="mt-5 text-center text-sm text-zinc-500">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
