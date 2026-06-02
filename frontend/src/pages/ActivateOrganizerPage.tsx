import { useState } from 'react';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import type { OrganizerType, ActivateOrganizerRequest } from '../features/organizers/services/organizerService';
import { activateOrganizer } from '../features/organizers/services/organizerService';

const ORGANIZER_TYPE_OPTIONS: { value: OrganizerType; label: string; description: string }[] = [
  { value: 'FACULTY_MEMBER',  label: 'Docente',            description: 'Profesor con facultad y departamento' },
  { value: 'INSTRUCTOR',      label: 'Instructor',          description: 'Instructor adscrito a una facultad' },
  { value: 'STUDENT_LEADER',  label: 'Líder estudiantil',   description: 'Estudiante ya registrado en UniPlan' },
  { value: 'WELLNESS_STAFF',  label: 'Personal de Bienestar', description: 'Staff administrativo de Bienestar' },
];

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
const label = 'block text-sm font-medium text-gray-700 mb-1';
const required = <span className="text-red-500 ml-0.5">*</span>;

function Field({
  id, labelText, req, children,
}: {
  id: string; labelText: string; req?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {labelText}{req && required}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mt-2">
      {children}
    </p>
  );
}

const EMPTY: Record<string, string> = {};

export default function ActivateOrganizerPage() {
  const [organizerType, setOrganizerType] = useState<OrganizerType | ''>('');
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(type: OrganizerType | '') {
    setOrganizerType(type);
    setForm(EMPTY);
    setSuccess(null);
    setError(null);
  }

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function v(field: string) {
    return form[field] ?? '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!organizerType) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: ActivateOrganizerRequest = { organizerType };

      if (organizerType === 'STUDENT_LEADER') {
        payload.userId = Number(v('userId'));
        payload.academicProgramCode = Number(v('academicProgramCode'));
        payload.semester = v('semester');
        payload.studentGroup = v('studentGroup');
      } else {
        payload.institutionalEmployeeId = v('institutionalEmployeeId');
        payload.institutionalEmail = v('institutionalEmail');
        payload.username = v('username');
        payload.firstName = v('firstName');
        payload.lastName = v('lastName');
        payload.temporaryPassword = v('temporaryPassword');

        if (organizerType === 'FACULTY_MEMBER') {
          payload.facultyCode = Number(v('facultyCode'));
          payload.department = v('department');
          if (v('specializationArea')) payload.specializationArea = v('specializationArea');
        }

        if (organizerType === 'INSTRUCTOR') {
          payload.facultyCode = Number(v('facultyCode'));
        }

        if (organizerType === 'WELLNESS_STAFF') {
          payload.administrativeAreaCode = Number(v('administrativeAreaCode'));
          payload.jobTitle = v('jobTitle');
        }
      }

      const result = await activateOrganizer(payload);
      setSuccess(
        `Organizador "${result.username}" activado correctamente como ${
          ORGANIZER_TYPE_OPTIONS.find((o) => o.value === result.organizerType)?.label
        }.`
      );
      setForm(EMPTY);
      setOrganizerType('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar el organizador.');
    } finally {
      setSubmitting(false);
    }
  }

  const isEmployeeType =
    organizerType === 'FACULTY_MEMBER' ||
    organizerType === 'INSTRUCTOR' ||
    organizerType === 'WELLNESS_STAFF';

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="w-5 h-5 text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-900">Activar organizador</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Tipo de organizador */}
          <Field id="organizerType" labelText="Tipo de organizador" req>
            <select
              id="organizerType"
              value={organizerType}
              onChange={(e) => handleTypeChange(e.target.value as OrganizerType | '')}
              required
              className={`${input} bg-white`}
            >
              <option value="">Selecciona un tipo…</option>
              {ORGANIZER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.description}
                </option>
              ))}
            </select>
          </Field>

          {/* ── STUDENT_LEADER ─────────────────────────────────────────────── */}
          {organizerType === 'STUDENT_LEADER' && (
            <>
              <SectionTitle>Estudiante existente en UniPlan</SectionTitle>

              <Field id="userId" labelText="ID de usuario UniPlan" req>
                <input
                  id="userId"
                  type="number"
                  min={1}
                  required
                  value={v('userId')}
                  onChange={set('userId')}
                  placeholder="ej. 42"
                  className={input}
                />
                <p className="text-xs text-gray-400 mt-1">
                  El estudiante debe estar previamente registrado en UniPlan.
                </p>
              </Field>

              <SectionTitle>Datos del liderazgo</SectionTitle>

              <div className="grid grid-cols-2 gap-4">
                <Field id="academicProgramCode" labelText="Código de programa" req>
                  <input
                    id="academicProgramCode"
                    type="number"
                    required
                    value={v('academicProgramCode')}
                    onChange={set('academicProgramCode')}
                    placeholder="ej. 2151"
                    className={input}
                  />
                </Field>
                <Field id="semester" labelText="Semestre" req>
                  <input
                    id="semester"
                    required
                    value={v('semester')}
                    onChange={set('semester')}
                    placeholder="ej. 6"
                    className={input}
                  />
                </Field>
              </div>

              <Field id="studentGroup" labelText="Grupo / asociación que representa" req>
                <input
                  id="studentGroup"
                  required
                  value={v('studentGroup')}
                  onChange={set('studentGroup')}
                  placeholder="ej. Consejo Estudiantil de Ingeniería"
                  className={input}
                />
              </Field>
            </>
          )}

          {/* ── FACULTY_MEMBER / INSTRUCTOR / WELLNESS_STAFF ───────────────── */}
          {isEmployeeType && (
            <>
              <SectionTitle>Datos institucionales</SectionTitle>

              <div className="grid grid-cols-2 gap-4">
                <Field id="institutionalEmployeeId" labelText="ID empleado institucional" req>
                  <input
                    id="institutionalEmployeeId"
                    required
                    value={v('institutionalEmployeeId')}
                    onChange={set('institutionalEmployeeId')}
                    placeholder="ej. EMP-00123"
                    className={input}
                  />
                </Field>
                <Field id="institutionalEmail" labelText="Correo institucional" req>
                  <input
                    id="institutionalEmail"
                    type="email"
                    required
                    value={v('institutionalEmail')}
                    onChange={set('institutionalEmail')}
                    placeholder="nombre@universidad.edu.co"
                    className={input}
                  />
                </Field>
              </div>

              <SectionTitle>Cuenta UniPlan</SectionTitle>

              <div className="grid grid-cols-2 gap-4">
                <Field id="firstName" labelText="Nombre" req>
                  <input
                    id="firstName"
                    required
                    value={v('firstName')}
                    onChange={set('firstName')}
                    placeholder="ej. Carlos"
                    className={input}
                  />
                </Field>
                <Field id="lastName" labelText="Apellido" req>
                  <input
                    id="lastName"
                    required
                    value={v('lastName')}
                    onChange={set('lastName')}
                    placeholder="ej. Ramírez"
                    className={input}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field id="username" labelText="Nombre de usuario" req>
                  <input
                    id="username"
                    required
                    value={v('username')}
                    onChange={set('username')}
                    placeholder="ej. carlos_ramirez"
                    className={input}
                  />
                </Field>
                <Field id="temporaryPassword" labelText="Contraseña temporal" req>
                  <input
                    id="temporaryPassword"
                    type="password"
                    required
                    minLength={8}
                    value={v('temporaryPassword')}
                    onChange={set('temporaryPassword')}
                    placeholder="Mínimo 8 caracteres"
                    className={input}
                  />
                </Field>
              </div>

              {/* FACULTY_MEMBER */}
              {organizerType === 'FACULTY_MEMBER' && (
                <>
                  <SectionTitle>Datos docentes</SectionTitle>
                  <div className="grid grid-cols-2 gap-4">
                    <Field id="facultyCode" labelText="Código de facultad" req>
                      <input
                        id="facultyCode"
                        type="number"
                        required
                        value={v('facultyCode')}
                        onChange={set('facultyCode')}
                        placeholder="ej. 10"
                        className={input}
                      />
                    </Field>
                    <Field id="department" labelText="Departamento académico" req>
                      <input
                        id="department"
                        required
                        value={v('department')}
                        onChange={set('department')}
                        placeholder="ej. Ciencias de la Computación"
                        className={input}
                      />
                    </Field>
                  </div>
                  <Field id="specializationArea" labelText="Área de especialización">
                    <input
                      id="specializationArea"
                      value={v('specializationArea')}
                      onChange={set('specializationArea')}
                      placeholder="ej. Inteligencia Artificial (opcional)"
                      className={input}
                    />
                  </Field>
                </>
              )}

              {/* INSTRUCTOR */}
              {organizerType === 'INSTRUCTOR' && (
                <>
                  <SectionTitle>Datos del instructor</SectionTitle>
                  <Field id="facultyCode" labelText="Código de facultad" req>
                    <input
                      id="facultyCode"
                      type="number"
                      required
                      value={v('facultyCode')}
                      onChange={set('facultyCode')}
                      placeholder="ej. 10"
                      className={input}
                    />
                  </Field>
                </>
              )}

              {/* WELLNESS_STAFF */}
              {organizerType === 'WELLNESS_STAFF' && (
                <>
                  <SectionTitle>Datos de Bienestar</SectionTitle>
                  <div className="grid grid-cols-2 gap-4">
                    <Field id="administrativeAreaCode" labelText="Código de área administrativa" req>
                      <input
                        id="administrativeAreaCode"
                        type="number"
                        required
                        value={v('administrativeAreaCode')}
                        onChange={set('administrativeAreaCode')}
                        placeholder="ej. 5"
                        className={input}
                      />
                    </Field>
                    <Field id="jobTitle" labelText="Cargo" req>
                      <input
                        id="jobTitle"
                        required
                        value={v('jobTitle')}
                        onChange={set('jobTitle')}
                        placeholder="ej. Coordinador de Bienestar"
                        className={input}
                      />
                    </Field>
                  </div>
                </>
              )}
            </>
          )}

          {/* Feedback */}
          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0" />
              {success}
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {organizerType && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? 'Activando…' : 'Activar organizador'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
