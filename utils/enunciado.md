UniPlan: Plataforma para la Organización y Gestión de Eventos en la Universidad

La Dirección de Bienestar Universitario de la Universidad Icesi ha identificado dificultades en la gestión y difusión de actividades extracurriculares dirigidas a los estudiantes. Actualmente, eventos como talleres, charlas, torneos deportivos, actividades culturales, clubes estudiantiles y jornadas de voluntariado se publican en distintos medios (redes sociales, correos electrónicos y carteleras físicas), lo que genera dispersión de la información. Como consecuencia, los estudiantes no siempre se enteran oportunamente de los eventos ni cuentan con información clara sobre su participación.

Adicionalmente, los organizadores (profesores, líderes estudiantiles o personal de Bienestar Universitario) enfrentan dificultades para gestionar inscripciones y controlar la asistencia. Las reservas se realizan mediante herramientas externas (formularios o listas compartidas) que no permiten validar cupos disponibles ni gestionar de forma estructurada a los participantes.

Con el objetivo de mejorar esta situación, la universidad desarrollará una aplicación web denominada UniPlan, que centralizará la publicación, consulta e inscripción a eventos universitarios.

UniPlan deberá gestionar de forma independiente el registro y autenticación de sus usuarios, tomando la base de datos institucional únicamente como fuente de consulta para validar información académica y administrativa. El sistema no deberá modificar la estructura ni los datos de dicha base de datos.

Para acceder a la plataforma, los estudiantes deberán registrarse proporcionando su código estudiantil, correo institucional y contraseña. El sistema validará que el estudiante exista en la base de datos institucional y que no esté previamente registrado.

El sistema contará con un módulo de administración en el que se registrarán los organizadores, previa validación con la base de datos institucional. El administrador del sistema será el jefe del área de Bienestar Universitario. Los organizadores se clasificarán en diferentes tipos de usuario, cada uno con atributos específicos (Si la información requerida ya se encuentra disponible en la base de datos institucional, deberá ser consultada desde esta y no duplicada en las estructuras propias del sistema.):

Profesores: deberán registrar su facultad, departamento académico y área de especialización.

Líderes estudiantiles: deberán registrar su programa académico, semestre y grupo o asociación que representan.

Personal de Bienestar Universitario: deberán registrar el área administrativa a la que pertenecen y su cargo.

Una vez autenticado, el estudiante podrá consultar el catálogo de eventos disponibles. Para cada evento se mostrará información como título, tipo de actividad, fecha, hora, ubicación, descripción y número de cupos disponibles. El sistema permitirá filtrar eventos por tipo, rango de fechas y estado (próximos, en curso o finalizados).

Al seleccionar un evento, el estudiante podrá visualizar su detalle y, si lo desea, solicitar la inscripción. El sistema validará que existan cupos disponibles y que el estudiante no esté previamente inscrito en ese evento.

Adicionalmente, el proceso de inscripción dependerá del tipo de evento, aplicando validaciones específicas:

Talleres: se deberá validar el cumplimiento de un requisito previo. El cumplimiento del requisito deberá verificarse consultando la información académica del estudiante disponible en la base de datos relacional.

Torneos deportivos: se deberá verificar que el estudiante no esté inscrito en otro evento del mismo tipo en un horario que se traslape.

Actividades de voluntariado: se deberá validar el cumplimiento de un mínimo de horas requeridas.

Charlas: no requerirán validaciones adicionales más allá de la disponibilidad de cupos.

Si la inscripción es válida, se registrará la participación del estudiante y se mostrará una confirmación.

El estudiante podrá cancelar su inscripción desde su perfil. En caso de cancelación válida, el sistema liberará el cupo correspondiente.

Los organizadores podrán crear eventos ingresando información como título, descripción, tipo, fecha, hora de inicio y finalización, ubicación y número máximo de asistentes.

El sistema deberá contemplar diferentes tipos de eventos, cada uno con características específicas:

Talleres: podrán incluir lista de materiales requeridos y condiciones previas (requisito de haber realizado previamente un curso específico o estar en determinado semestre).

Charlas: podría incluir información del conferencista (nombre, perfil, afiliación), enlaces relacionados (ej: streaming, recursos), descripción extendida.

Torneos deportivos: podrían incluir: tipo de deporte, reglas específicas del torneo, número de equipos o participantes por equipo, estructura del torneo (eliminación directa, grupos, etc.).

Actividades de voluntariado: podrán incluir: causa o comunidad beneficiada, número de horas requeridas, actividades a realizar (lista), información logística (puntos de encuentro, responsables).

Otros eventos (culturales, clubes, etc.) podrán contener información adicional no prevista inicialmente.

El sistema validará que la fecha no sea pasada y que el número de cupos sea mayor que cero antes de permitir la publicación. La solución deberá proponer un modelo de datos que permita representar esta variabilidad de forma eficiente y flexible.

Al crearse el evento, se generará un código único que permitirá su identificación.

Una vez publicado un evento, los organizadores podrán consultar la lista de inscritos, incluyendo nombre, código estudiantil y correo institucional. Adicionalmente, el sistema permitirá exportar esta información en formato CSV para fines administrativos y control de asistencia.

Adicionalmente, el sistema deberá mantener una estructura relacional para estadísticas de eventos, orientada a la consulta administrativa. Esta estructura no hará parte del modelo transaccional principal del sistema, sino que almacenará información agregada sobre cada evento, como número de inscritos, cancelaciones, asistentes y porcentaje de ocupación. La solución deberá definir cuándo y cómo se actualiza esta información, garantizando consistencia entre los datos operacionales y las estadísticas.

El cliente desea propuestas innovadoras, para ello tendrá en cuenta que se muestren informes que puedan ser de interés para los usuarios, por lo menos dos informes que tengan valor para el usuario.

Dado que la plataforma manejará información personal de los estudiantes y será utilizada frecuentemente durante el semestre académico, la universidad espera que el sistema tenga alta disponibilidad durante los periodos académicos y que las consultas de eventos y procesos de inscripción se realicen sin demoras perceptibles para los usuarios. Asimismo, la información personal registrada en el sistema deberá almacenarse de forma segura y no podrá ser visible para otros estudiantes distintos al organizador del evento o al personal autorizado.


