# UniPlan — Internos de Base de Datos

## Arquitectura general

UniPlan usa **tres fuentes de datos** con responsabilidades separadas:

| Fuente | Motor | Propósito | Acceso |
|--------|-------|-----------|--------|
| `uniplan` | PostgreSQL 16 | Datos transaccionales propios | Lectura / Escritura |
| `university` | PostgreSQL 16 | Datos institucionales de la universidad | Solo lectura |
| `uniplan_db` | MongoDB Atlas (MongoDB 7) | Metadatos dinámicos de eventos | Lectura / Escritura |

---

## Usuarios y roles de base de datos

### Usuario `uniplan`

Es el único usuario de aplicación. Tiene acceso a ambas bases de datos PostgreSQL pero con permisos distintos.

**Sobre `uniplan` (base propia):**
```sql
-- Propietario de todas las tablas; puede leer, escribir, modificar y eliminar.
GRANT ALL PRIVILEGES ON DATABASE uniplan TO uniplan;
```

**Sobre `university` (base institucional):**
```sql
-- Solo SELECT en cada tabla. No tiene INSERT, UPDATE ni DELETE.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO uniplan;
```

Verificación real:
```
 grantee | table_name  | privileges
---------+-------------+-----------
 uniplan | students    | SELECT
 uniplan | employees   | SELECT
 uniplan | enrollments | SELECT
 uniplan | groups      | SELECT
 uniplan | subjects    | SELECT
 ...     | ...         | SELECT     ← Solo SELECT en las 15 tablas
```

**MongoDB Atlas:** La conexión usa el usuario `uniplan` definido en Atlas con rol `readWrite` sobre la base `uniplan_db`.

---

## Base de datos `uniplan` (PostgreSQL)

### Diagrama de tablas

```
uniplan_users
    id (PK)
    username (UNIQUE)
    institutional_email (UNIQUE)
    institutional_student_id
    institutional_employee_id
    first_name, last_name
    password_hash
    role  ── STUDENT | EMPLOYEE | ADMIN
    active, created_at
         │
         │ 1:1
         ▼
organizer_profiles
    id (PK)
    user_id (FK → uniplan_users, UNIQUE)
    organizer_type  ── FACULTY_MEMBER | WELLNESS_STAFF | INSTRUCTOR | STUDENT_LEADER
    enabled
    faculty_code, department, specialization_area   ← FACULTY_MEMBER / INSTRUCTOR
    administrative_area_code, job_title             ← WELLNESS_STAFF
    academic_program_code, semester, student_group  ← STUDENT_LEADER
    created_at
         │
         │ 1:N
         ▼
events
    id (PK)
    event_code (UNIQUE, VARCHAR 20)
    title (VARCHAR 150)
    description (TEXT)
    event_type  ── TALK | WORKSHOP | SPORTS_TOURNAMENT | VOLUNTEER | OTHER
    status      ── DRAFT | PUBLISHED | ONGOING | COMPLETED | CANCELLED
    start_date_time, end_date_time
    location (VARCHAR 200)
    max_capacity, available_slots
    organizer_id (FK → organizer_profiles)
    created_at, updated_at
         │
         ├─────────────────────────────────────────────────────────┐
         │ 1:1                                                     │ 1:N
         ▼                                                         ▼
event_statistics                                      event_registrations
    id (PK)                                               event_id (PK, FK → events)
    event_id (FK → events, UNIQUE)                        student_user_id (PK, FK → uniplan_users)
    total_registered                                      status  ── REGISTERED | CANCELLED | ATTENDED
    total_cancelled                                       registration_date
    total_attended                                        cancellation_date
    occupancy_percentage                                       │
    last_updated                                               │ 1:1
                                                               ▼
                                                  event_attendances
                                                      id (PK)
                                                      event_id (FK → event_registrations)
                                                      student_user_id (FK → event_registrations)
                                                      attended (BOOLEAN)
                                                      attendance_time
                                                           │
                                                           │ 1:N
                                                           ▼
                                                  volunteer_participations
                                                      id (PK)
                                                      event_id (FK → event_registrations)
                                                      student_user_id (FK → event_registrations)
                                                      validated_hours (DOUBLE)
                                                      validated_at
                                                      validated_by_user_id (FK → uniplan_users)
```

### Índices

| Tabla | Índice | Columnas | Tipo |
|-------|--------|----------|------|
| `events` | `idx_events_status` | `status` | B-tree |
| `events` | `idx_events_event_type` | `event_type` | B-tree |
| `events` | `idx_events_start_date_time` | `start_date_time` | B-tree |
| `events` | `idx_events_organizer_id` | `organizer_id` | B-tree |
| `events` | `uq_events_event_code` | `event_code` | Único |
| `uniplan_users` | `uq_uniplan_users_username` | `username` | Único |
| `uniplan_users` | `uk7lp...` | `institutional_email` | Único |
| `uniplan_users` | `idx_..._student_id` | `institutional_student_id` | B-tree |
| `uniplan_users` | `idx_..._employee_id` | `institutional_employee_id` | B-tree |
| `event_registrations` | PK compuesta | `(event_id, student_user_id)` | Único |
| `event_attendances` | `uketv2...` | `(event_id, student_user_id)` | Único |
| `event_statistics` | `uq_event_statistics_event_id` | `event_id` | Único |
| `volunteer_participations` | `idx_..._event_student` | `(event_id, student_user_id)` | B-tree |
| `audit_logs` | `idx_audit_logs_user_id` | `user_id` | B-tree |
| `audit_logs` | `idx_audit_logs_entity_name` | `entity_name` | B-tree |

---

## Queries que genera JPA en operaciones clave

### 1. Registro de estudiante (`POST /registrations`)

```sql
-- 1. Buscar evento por ID
SELECT e.id, e.title, e.event_type, e.status, e.available_slots, e.max_capacity,
       e.start_date_time, e.end_date_time, e.location, e.organizer_id, ...
FROM events e
WHERE e.id = ?;

-- 2. Buscar estudiante por ID
SELECT u.id, u.username, u.role, u.institutional_student_id, ...
FROM uniplan_users u
WHERE u.id = ?;

-- 3. Verificar si ya existe una inscripción
SELECT er.event_id, er.student_user_id, er.status, er.registration_date, er.cancellation_date
FROM event_registrations er
WHERE er.event_id = ? AND er.student_user_id = ?;

-- 4a. Si no existe: decrementar cupo e insertar inscripción
UPDATE events SET available_slots = ?, updated_at = ? WHERE id = ?;

INSERT INTO event_registrations (event_id, student_user_id, status, registration_date)
VALUES (?, ?, 'REGISTERED', ?);

-- 4b. Si existe con status CANCELLED: reactivar
UPDATE event_registrations
SET status = 'REGISTERED', registration_date = ?, cancellation_date = NULL
WHERE event_id = ? AND student_user_id = ?;

UPDATE events SET available_slots = ?, updated_at = ? WHERE id = ?;

-- 5. Refrescar estadísticas (al final de la transacción)
SELECT COUNT(*) FROM event_registrations WHERE event_id = ? AND status = 'REGISTERED';
SELECT COUNT(*) FROM event_registrations WHERE event_id = ? AND status = 'CANCELLED';

-- Upsert estadísticas
SELECT es.id, es.event_id, es.total_registered, es.total_cancelled, ...
FROM event_statistics es WHERE es.event_id = ?;

UPDATE event_statistics
SET total_registered = ?, total_cancelled = ?, occupancy_percentage = ?, last_updated = ?
WHERE id = ?;
-- (o INSERT si no existía)
```

**Validaciones extra por tipo de evento (dentro de la misma transacción):**

```sql
-- WORKSHOP: verifica prerequisitos académicos (en university DB)
SELECT COUNT(*) FROM enrollments e
JOIN groups g ON e.nrc = g.nrc
WHERE e.student_id = ? AND g.subject_code = ? AND e.status = 'Approved';

SELECT COUNT(DISTINCT g.semester) FROM enrollments e
JOIN groups g ON e.nrc = g.nrc
WHERE e.student_id = ? AND e.status = 'Approved';

-- SPORTS_TOURNAMENT: verifica traslape de horario
SELECT er.event_id, er.student_user_id, e.start_date_time, e.end_date_time, e.event_type
FROM event_registrations er
JOIN events e ON er.event_id = e.id
WHERE er.student_user_id = ? AND er.status = 'REGISTERED';

-- VOLUNTEER: suma horas validadas del estudiante
SELECT SUM(vp.validated_hours)
FROM volunteer_participations vp
WHERE vp.student_user_id = ?;
```

---

### 2. Cancelación de inscripción (`DELETE /registrations/{eventId}`)

```sql
-- 1. Buscar inscripción
SELECT er.event_id, er.student_user_id, er.status, ...
FROM event_registrations er
WHERE er.event_id = ? AND er.student_user_id = ?;

-- 2. Marcar como cancelada
UPDATE event_registrations
SET status = 'CANCELLED', cancellation_date = ?
WHERE event_id = ? AND student_user_id = ?;

-- 3. Liberar cupo
UPDATE events SET available_slots = available_slots + 1, updated_at = ? WHERE id = ?;

-- 4. Refrescar estadísticas (mismas queries que en inscripción)
```

---

### 3. Catálogo de eventos (`GET /events`)

```sql
-- Carga todos los eventos (filtrado en memoria en Java)
SELECT e.id, e.event_code, e.title, e.description, e.event_type, e.status,
       e.start_date_time, e.end_date_time, e.location,
       e.max_capacity, e.available_slots, e.organizer_id, e.created_at, e.updated_at
FROM events e;
```

> **Nota:** Los filtros por `eventType`, `status`, `startDate`, `endDate` se aplican con `stream().filter()` en Java después de cargar todos los eventos, **no** como cláusulas `WHERE` en la query. Los índices sobre estas columnas existen pero no son aprovechados por esta implementación.

---

### 4. Creación de evento (`POST /events`)

```sql
-- 1. Resolver organizador desde el contexto de seguridad
SELECT u.id FROM uniplan_users u WHERE u.username = ?;

SELECT op.id, op.user_id, op.organizer_type, op.enabled, ...
FROM organizer_profiles op WHERE op.user_id = ?;

-- 2. Verificar unicidad del código generado
SELECT COUNT(*) FROM events WHERE event_code = ?;

-- 3. Insertar evento
INSERT INTO events (event_code, title, description, event_type, status,
                   start_date_time, end_date_time, location,
                   max_capacity, available_slots, organizer_id, created_at, updated_at)
VALUES (?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?, ?, ?, ?);
```

Después del INSERT en Postgres, se persiste el documento en MongoDB (fuera de la transacción JPA):
```json
// MongoDB: colección event_details
{
  "eventId": 5,
  "eventType": "TALK",
  "dynamicData": {
    "speaker": "...",
    "affiliation": "...",
    "streamingLinks": ["..."]
  },
  "tags": ["tecnología", "IA"]
}
```

---

### 5. Publicación de evento (`PATCH /events/{id}/publish`)

```sql
UPDATE events SET status = 'PUBLISHED', updated_at = ? WHERE id = ?;
```

---

### 6. Eliminación de evento (`DELETE /events/{id}`)

```sql
-- Cascade manual en orden para respetar FK
SELECT vp.id, vp.event_id, vp.student_user_id, ...
FROM volunteer_participations vp WHERE vp.event_id = ?;
DELETE FROM volunteer_participations WHERE id IN (...);

SELECT ea.id, ... FROM event_attendances ea WHERE ea.event_id = ?;
DELETE FROM event_attendances WHERE id IN (...);

SELECT er.event_id, er.student_user_id, ...
FROM event_registrations er WHERE er.event_id = ?;
DELETE FROM event_registrations WHERE event_id = ? AND student_user_id = ?;

SELECT es.id, ... FROM event_statistics es WHERE es.event_id = ?;
DELETE FROM event_statistics WHERE id = ?;

-- MongoDB (fuera de transacción JPA)
-- db.event_details.deleteOne({ eventId: 5 })

DELETE FROM events WHERE id = ?;
```

---

### 7. Registro de usuario (`POST /auth/register`)

```sql
-- 1. Verificar duplicados
SELECT COUNT(*) FROM uniplan_users WHERE username = ?;

SELECT u.id FROM uniplan_users u WHERE u.institutional_student_id = ?;

SELECT COUNT(*) FROM uniplan_users WHERE institutional_email = ?;

-- 2. Validar en university DB (si está configurada)
SELECT COUNT(*) FROM students WHERE id = ? AND email = ?;

-- 3. Insertar usuario con role = STUDENT
INSERT INTO uniplan_users (username, first_name, last_name, institutional_student_id,
                           institutional_email, password_hash, role, active, created_at)
VALUES (?, ?, ?, ?, ?, '$2a$10$...', 'STUDENT', true, ?);
```

---

## Base de datos `university` (PostgreSQL — solo lectura)

Las tablas relevantes para UniPlan son:

| Tabla | Uso en UniPlan |
|-------|---------------|
| `students` | Validar que el estudiante existe al registrarse |
| `employees` | Validar que el empleado existe al activar organizador |
| `enrollments` | Verificar prerequisitos de talleres (cursos aprobados) |
| `groups` | JOIN con enrollments para obtener código de materia y semestre |

Queries que ejecuta UniPlan sobre `university`:

```sql
-- Validar existencia de estudiante (registro)
SELECT COUNT(*) FROM students WHERE id = ? AND email = ?;

-- Validar existencia de empleado (activación de organizador)
SELECT COUNT(*) FROM employees
WHERE id = ? AND email = ? AND employee_type = ?;
-- employee_type: 'Docente' | 'Instructor' | 'Administrativo'

-- Verificar materia aprobada (inscripción a taller)
SELECT COUNT(*) FROM enrollments e
JOIN groups g ON e.nrc = g.nrc
WHERE e.student_id = ? AND g.subject_code = ? AND e.status = 'Approved';

-- Contar semestres completados (inscripción a taller)
SELECT COUNT(DISTINCT g.semester) FROM enrollments e
JOIN groups g ON e.nrc = g.nrc
WHERE e.student_id = ? AND e.status = 'Approved';
```

---

## Base de datos `uniplan_db` (MongoDB Atlas)

### Colección `event_details`

Relación **uno a uno** con la tabla `events` de PostgreSQL, enlazada por `eventId`.

**Estructura de un documento:**
```json
{
  "_id": "ObjectId('...')",
  "eventId": 1,
  "eventType": "TALK",
  "dynamicData": {
    "speaker": "Juan Pérez",
    "affiliation": "Facultad de Ciencias — UniCali",
    "streamingLinks": ["https://meet.univcali.edu.co/charla-ia"],
    "resources": ["Slides", "Bibliografía"]
  },
  "tags": ["inteligencia artificial", "tecnología", "charla"],
  "metadata": null
}
```

**Índices en MongoDB:**
```
{ eventId: 1 }  →  único (enforza relación 1:1 con events)
{ eventType: 1, tags: 1 }  →  compuesto (filtrado de catálogo)
{ eventType: 1 }  →  individual
{ tags: 1 }  →  multikey (cada elemento del array es una entrada)
```

**`dynamicData` por tipo de evento:**

| Tipo | Campos requeridos | Campos opcionales |
|------|-------------------|-------------------|
| `TALK` | `speaker`, `affiliation` | `streamingLinks[]`, `resources[]` |
| `WORKSHOP` | `requiredMaterials[]`, `minimumSemester` | `requiredCourse` |
| `SPORTS_TOURNAMENT` | `sportType`, `teamCount`, `bracketType` | `rules` |
| `VOLUNTEER` | `beneficiaryCause`, `requiredHours` | `meetingPoints[]`, `logistics{}` |
| `OTHER` | — | cualquier estructura |

---

## Flujo de transacciones

```
POST /registrations
│
├─ BEGIN TRANSACTION (PostgreSQL — JPA)
│   ├─ SELECT events WHERE id = ?
│   ├─ SELECT uniplan_users WHERE id = ?
│   ├─ [university DB] SELECT COUNT(*) ... (conexión separada, sin transacción JPA)
│   ├─ [MongoDB] findByEventId (sin transacción JPA)
│   ├─ SELECT event_registrations WHERE event_id = ? AND student_user_id = ?
│   ├─ UPDATE events SET available_slots = ?
│   ├─ INSERT event_registrations
│   ├─ SELECT COUNT(*) ... (estadísticas)
│   └─ UPDATE event_statistics
└─ COMMIT / ROLLBACK (solo PostgreSQL)
```

> MongoDB y `university` operan en conexiones independientes. Si la escritura en Postgres tiene éxito pero MongoDB falla, no hay rollback automático de Postgres (sin transacción distribuida).
