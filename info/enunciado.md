UniPlan: A Platform for Organizing and Managing University Events

The Office of Student Wellness at Icesi University has identified challenges in managing and promoting extracurricular activities for students. Currently, events such as workshops, talks, sports tournaments, cultural activities, student clubs, and volunteer days are published across various channels (social media, emails, and physical bulletin boards), leading to scattered information. As a result, students do not always learn about events in a timely manner nor do they have clear information regarding participation.

Additionally, organizers (professorship, student leaders, or University Wellness staff) face difficulties managing registrations and tracking attendance. Reservations are made using external tools (forms or shared lists) that do not allow for validating available spots or managing participants in a structured manner.

To address this issue, the university will develop a web application called UniPlan, which will centralize the publication, viewing, and registration for university events.

UniPlan must independently manage user registration and authentication, using the institutional database solely as a reference source to validate academic and administrative information. The system must not modify the structure or data of that database.

To access the platform, students must register by providing their student ID, institutional email address, and password. The system will verify that the student exists in the institutional database and has not previously registered.

The system will include an administration module where organizers will be registered, following validation against the institutional database. The system administrator will be the head of the University Wellness Department. Organizers will be classified into different user types, each with specific attributes (If the required information is already available in the institutional database, it must be retrieved from there and not duplicated in the system’s own structures.):

Faculty (professorship): must enter their school, academic department, and area of specialization.

Student leaders: must enter their academic program, semester, and the group or association they represent.

Student Wellness staff: must enter the administrative unit to which they belong and their job title.

Once logged in, students will be able to view the catalog of available events. For each event, information such as title, activity type, date, time, location, description, and number of available spots will be displayed. The system will allow users to filter events by type, date range, and status (upcoming, ongoing, or completed).

When selecting an event, the student will be able to view its details and, if desired, request registration. The system will verify that there are available spots and that the student is not already registered for that event.

Additionally, the registration process will depend on the type of event, with specific validations applied:

Workshops: Compliance with a prerequisite must be validated. Compliance with the prerequisite must be verified by consulting the student’s academic information available in the relational database.

Sports tournaments: It must be verified that the student is not registered for another event of the same type at a time that overlaps.

Volunteer activities: Compliance with a minimum number of required hours must be validated.

Talks: No additional validations are required beyond checking availability.

If the registration is valid, the student’s participation will be recorded and a confirmation will be displayed.

The student may cancel their registration from their profile. In the event of a valid cancellation, the system will release the corresponding spot.

Organizers will be able to create events by entering information such as title, description, type, date, start and end times, location, and maximum number of attendees.

The system should support different types of events, each with specific characteristics:

Workshops: may include a list of required materials and prerequisites (such as having previously completed a specific course or being in a certain semester).

Talks: may include information about the speaker (name, profile, affiliation), related links (e.g., livestream, resources), and an extended description.

Sports tournaments: may include: type of sport, specific tournament rules, number of teams or participants per team, and tournament structure (knockout, groups, etc.).

Volunteer activities: may include: cause or community benefiting, number of hours required, activities to be performed (list), logistical information (meeting points, coordinators).

Other events (cultural, clubs, etc.) may contain additional information not initially planned.

The system will verify that the date is not in the past and that the number of available spots is greater than zero before allowing the event to be published. The solution must propose a data model that allows this variability to be represented efficiently and flexibly.

When the event is created, a unique code will be generated to identify it.

Once an event is published, organizers will be able to view the list of registrants, including name, student ID, and institutional email address. Additionally, the system will allow this information to be exported in CSV format for administrative purposes and attendance tracking.

In addition, the system must maintain a relational structure for event statistics, designed for administrative queries. This structure will not be part of the system’s main transactional model; rather, it will store aggregated information about each event, such as the number of registrants, cancellations, attendees, and occupancy rate. The solution must define when and how this information is updated, ensuring consistency between operational data and statistics.

The client is seeking innovative proposals; to this end, it will consider the inclusion of reports that may be of interest to users, with at least two reports that provide value to the user.

Since the platform will handle students’ personal information and will be used frequently during the academic semester, the university expects the system to have high availability during academic periods and for event inquiries and registration processes to be carried out without delays noticeable to users. Furthermore, the personal information recorded in the system must be stored securely and must not be visible to students other than the event organizer or authorized staff.