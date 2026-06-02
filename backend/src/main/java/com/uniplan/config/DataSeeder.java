package com.uniplan.config;

import com.uniplan.document.EventDetailDocument;
import com.uniplan.document.enums.DocumentEventType;
import com.uniplan.entity.*;
import com.uniplan.entity.enums.*;
import com.uniplan.entity.ids.EventRegistrationId;
import com.uniplan.repository.jpa.*;
import com.uniplan.repository.mongo.EventDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Seeds initial data for development and testing.
 * Idempotent: skips execution if the admin account already exists.
 *
 * Users seeded
 * ─────────────────────────────────────────────────────────────────────
 * ADMIN    │ bienestar_admin        │ Admin2024!
 * EMPLOYEE │ juan.perez             │ Org2024!   (FACULTY_MEMBER)
 * EMPLOYEE │ maria.gomez            │ Org2024!   (WELLNESS_STAFF)
 * EMPLOYEE │ paula.ramirez          │ Org2024!   (INSTRUCTOR)
 * EMPLOYEE │ luis.ramirez           │ Org2024!   (STUDENT_LEADER — promoted)
 * STUDENT  │ laura.hernandez        │ Student2024!
 * STUDENT  │ pedro.martinez         │ Student2024!
 * STUDENT  │ ana.suarez             │ Student2024!
 * STUDENT  │ sofia.garcia           │ Student2024!
 * ─────────────────────────────────────────────────────────────────────
 * All institutional IDs are consistent with the university DB.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UniplanUserRepository userRepository;
    private final OrganizerProfileRepository organizerProfileRepository;
    private final EventRepository eventRepository;
    private final EventDetailRepository eventDetailRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventStatisticsRepository statisticsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seed();
    }

    public void seed() {
        if (userRepository.existsByUsername("bienestar_admin")) {
            log.info("[Seed] Already seeded — skipping.");
            return;
        }
        log.info("[Seed] Seeding initial data...");

        // ── 1. Admin ──────────────────────────────────────────────────────────
        // Julián Reyes (1006, Administrativo) acts as head of Bienestar.
        saveUser("bienestar_admin", "Julián", "Reyes",
                null, "1006", "julian.reyes@univcali.edu.co",
                UserRole.ADMIN, "Admin2024!");

        // ── 2. Organizer employees ────────────────────────────────────────────
        UniplanUser juan  = saveUser("juan.perez", "Juan", "Pérez",
                null, "1001", "juan.perez@univcali.edu.co",
                UserRole.EMPLOYEE, "Org2024!");

        UniplanUser maria = saveUser("maria.gomez", "María", "Gómez",
                null, "1002", "maria.gomez@univcali.edu.co",
                UserRole.EMPLOYEE, "Org2024!");

        UniplanUser paula = saveUser("paula.ramirez", "Paula", "Ramírez",
                null, "1007", "paula.ramirez@univcali.edu.co",
                UserRole.EMPLOYEE, "Org2024!");

        // Student leader: role is EMPLOYEE because activation promotes them.
        UniplanUser luis  = saveUser("luis.ramirez", "Luis", "Ramírez",
                "2004", null, "luis.ramirez@univcali.edu.co",
                UserRole.EMPLOYEE, "Org2024!");

        // ── 3. Students ───────────────────────────────────────────────────────
        UniplanUser laura = saveUser("laura.hernandez", "Laura", "Hernández",
                "2001", null, "laura.hernandez@univcali.edu.co",
                UserRole.STUDENT, "Student2024!");

        UniplanUser pedro = saveUser("pedro.martinez", "Pedro", "Martínez",
                "2002", null, "pedro.martinez@univcali.edu.co",
                UserRole.STUDENT, "Student2024!");

        UniplanUser ana   = saveUser("ana.suarez", "Ana", "Suárez",
                "2003", null, "ana.suarez@univcali.edu.co",
                UserRole.STUDENT, "Student2024!");

        UniplanUser sofia = saveUser("sofia.garcia", "Sofía", "García",
                "2005", null, "sofia.garcia@univcali.edu.co",
                UserRole.STUDENT, "Student2024!");

        // ── 4. Organizer profiles ─────────────────────────────────────────────
        // Admin also gets a profile so they can create/manage events directly.
        organizerProfileRepository.save(OrganizerProfile.builder()
                .user(userRepository.findByUsername("bienestar_admin").orElseThrow())
                .organizerType(OrganizerType.WELLNESS_STAFF).enabled(true)
                .administrativeAreaCode(1).jobTitle("Jefe de Bienestar Universitario")
                .build());

        OrganizerProfile orgJuan = organizerProfileRepository.save(OrganizerProfile.builder()
                .user(juan).organizerType(OrganizerType.FACULTY_MEMBER).enabled(true)
                .facultyCode(1).department("Ciencias Básicas").specializationArea("Psicología General")
                .build());

        OrganizerProfile orgMaria = organizerProfileRepository.save(OrganizerProfile.builder()
                .user(maria).organizerType(OrganizerType.WELLNESS_STAFF).enabled(true)
                .administrativeAreaCode(3).jobTitle("Coordinadora de Bienestar Universitario")
                .build());

        OrganizerProfile orgPaula = organizerProfileRepository.save(OrganizerProfile.builder()
                .user(paula).organizerType(OrganizerType.INSTRUCTOR).enabled(true)
                .facultyCode(1).department("Área de Bienestar")
                .build());

        // Luis: student leader of IEEE UniCali chapter, Ingeniería de Sistemas (program 2).
        OrganizerProfile orgLuis = organizerProfileRepository.save(OrganizerProfile.builder()
                .user(luis).organizerType(OrganizerType.STUDENT_LEADER).enabled(true)
                .academicProgramCode(2).semester("2024-1").studentGroup("IEEE Student Chapter UniCali")
                .build());

        // ── 5. Events ─────────────────────────────────────────────────────────
        LocalDateTime t = LocalDateTime.now();

        Event talk = saveEvent("EVT-2026-TALK001",
                "Introducción a la Inteligencia Artificial",
                "Charla sobre los fundamentos y aplicaciones modernas de la IA en la industria y la academia.",
                EventType.TALK,
                t.plusDays(7), t.plusDays(7).plusHours(2),
                "Auditorio Principal — Edificio A", 50, orgJuan);

        Event workshop = saveEvent("EVT-2026-WKSP001",
                "Taller de Bienestar Mental",
                "Técnicas prácticas de manejo del estrés y mindfulness dirigidas a estudiantes universitarios.",
                EventType.WORKSHOP,
                t.plusDays(10), t.plusDays(10).plusHours(3),
                "Sala 201 — Edificio de Bienestar", 20, orgMaria);

        Event volunteer = saveEvent("EVT-2026-VLNT001",
                "Jornada de Reforestación Campus",
                "Voluntariado para reforestar el campus universitario con especies nativas de la región.",
                EventType.VOLUNTEER,
                t.plusDays(14), t.plusDays(14).plusHours(6),
                "Campus Norte — Portería Principal", 30, orgPaula);

        Event tournament = saveEvent("EVT-2026-TRNM001",
                "Torneo Interclases de Fútbol Sala",
                "Torneo de fútbol sala entre los grupos de los diferentes programas académicos de UniCali.",
                EventType.SPORTS_TOURNAMENT,
                t.plusDays(21), t.plusDays(21).plusHours(8),
                "Cancha Sintética — Bloque Deportivo", 40, orgLuis);

        // ── 6. MongoDB event details ──────────────────────────────────────────
        saveDetail(talk.getId(), DocumentEventType.TALK, Map.of(
                "speaker",        "Juan Pérez",
                "affiliation",    "Facultad de Ciencias — Área de Sociales, UniCali",
                "streamingLinks", List.of("https://meet.univcali.edu.co/charla-ia"),
                "resources",      List.of("Slides de la presentación", "Bibliografía recomendada")
        ), List.of("inteligencia artificial", "tecnología", "charla"));

        // Workshop: minimumSemester=1 — Laura (2001) has G101+G102 Active but 0 Approved semesters.
        // In a real scenario these would be 'Approved'. For demo, the validation will reject
        // unless university.datasource is configured (bypass logs a warning in dev mode).
        saveDetail(workshop.getId(), DocumentEventType.WORKSHOP, Map.of(
                "requiredMaterials", List.of("Cuaderno", "Esfero", "Ropa cómoda"),
                "minimumSemester",   1
        ), List.of("bienestar", "salud mental", "taller", "mindfulness"));

        // Volunteer: requiredHours=0 so any student can register.
        saveDetail(volunteer.getId(), DocumentEventType.VOLUNTEER, Map.of(
                "beneficiaryCause", "Reforestación del campus universitario — UniCali",
                "requiredHours",    0,
                "meetingPoints",    List.of("Portería principal campus norte"),
                "logistics",        Map.of("transportIncluded", false, "toolsProvided", true)
        ), List.of("voluntariado", "medio ambiente", "sostenibilidad", "campus"));

        saveDetail(tournament.getId(), DocumentEventType.SPORTS_TOURNAMENT, Map.of(
                "sportType",   "Fútbol Sala",
                "rules",       "Reglamento FIFA adaptado para torneos universitarios intramuros",
                "teamCount",   8,
                "bracketType", "Eliminación directa"
        ), List.of("deportes", "fútbol sala", "torneo", "interclases"));

        // ── 7. Registrations ──────────────────────────────────────────────────
        // Laura (2001): TALK + VOLUNTEER
        saveRegistration(talk,      laura);
        saveRegistration(volunteer, laura);
        // Pedro (2002): TALK + TOURNAMENT
        saveRegistration(talk,       pedro);
        saveRegistration(tournament, pedro);
        // Ana (2003): VOLUNTEER
        saveRegistration(volunteer, ana);
        // Sofía (2005): TALK + VOLUNTEER
        saveRegistration(talk,      sofia);
        saveRegistration(volunteer, sofia);

        // ── 8. Sync available slots ───────────────────────────────────────────
        // talk: 3 registrations (laura, pedro, sofia)  → 47 left
        // workshop: 0 registrations                     → 20 left
        // volunteer: 3 (laura, ana, sofia)              → 27 left
        // tournament: 1 (pedro)                         → 39 left
        talk.setAvailableSlots(47);       eventRepository.save(talk);
        volunteer.setAvailableSlots(27);  eventRepository.save(volunteer);
        tournament.setAvailableSlots(39); eventRepository.save(tournament);

        // ── 9. Statistics ─────────────────────────────────────────────────────
        saveStatistics(talk,       3, 0, 0, 6.0);
        saveStatistics(workshop,   0, 0, 0, 0.0);
        saveStatistics(volunteer,  3, 0, 0, 10.0);
        saveStatistics(tournament, 1, 0, 0, 2.5);

        log.info("[Seed] ─────────────────────────────────────────────");
        log.info("[Seed]  ADMIN    → bienestar_admin   / Admin2024!");
        log.info("[Seed]  EMPLOYEE → juan.perez        / Org2024!   (FACULTY_MEMBER, Fac. Ciencias)");
        log.info("[Seed]  EMPLOYEE → maria.gomez       / Org2024!   (WELLNESS_STAFF, Área Bienestar)");
        log.info("[Seed]  EMPLOYEE → paula.ramirez     / Org2024!   (INSTRUCTOR, Fac. Ciencias)");
        log.info("[Seed]  EMPLOYEE → luis.ramirez      / Org2024!   (STUDENT_LEADER, IEEE UniCali)");
        log.info("[Seed]  STUDENT  → laura.hernandez   / Student2024!");
        log.info("[Seed]  STUDENT  → pedro.martinez    / Student2024!");
        log.info("[Seed]  STUDENT  → ana.suarez        / Student2024!");
        log.info("[Seed]  STUDENT  → sofia.garcia      / Student2024!");
        log.info("[Seed] ─────────────────────────────────────────────");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private UniplanUser saveUser(String username, String firstName, String lastName,
                                  String studentId, String employeeId, String email,
                                  UserRole role, String rawPassword) {
        return userRepository.save(UniplanUser.builder()
                .username(username)
                .firstName(firstName)
                .lastName(lastName)
                .institutionalStudentId(studentId)
                .institutionalEmployeeId(employeeId)
                .institutionalEmail(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .active(true)
                .build());
    }

    private Event saveEvent(String code, String title, String description,
                             EventType type, LocalDateTime start, LocalDateTime end,
                             String location, int capacity, OrganizerProfile organizer) {
        return eventRepository.save(Event.builder()
                .eventCode(code)
                .title(title)
                .description(description)
                .eventType(type)
                .startDateTime(start)
                .endDateTime(end)
                .location(location)
                .maxCapacity(capacity)
                .availableSlots(capacity)
                .status(EventStatus.PUBLISHED)
                .organizer(organizer)
                .build());
    }

    private void saveDetail(Long eventId, DocumentEventType type,
                             Map<String, Object> data, List<String> tags) {
        eventDetailRepository.save(EventDetailDocument.builder()
                .eventId(eventId)
                .eventType(type)
                .dynamicData(data)
                .tags(tags)
                .build());
    }

    private void saveRegistration(Event event, UniplanUser student) {
        registrationRepository.save(EventRegistration.builder()
                .id(new EventRegistrationId(event.getId(), student.getId()))
                .event(event)
                .student(student)
                .status(RegistrationStatus.REGISTERED)
                .build());
    }

    private void saveStatistics(Event event, int registered, int cancelled,
                                 int attended, double occupancy) {
        statisticsRepository.save(EventStatistics.builder()
                .event(event)
                .totalRegistered(registered)
                .totalCancelled(cancelled)
                .totalAttended(attended)
                .occupancyPercentage(occupancy)
                .build());
    }
}
