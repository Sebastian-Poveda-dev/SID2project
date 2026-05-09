Entidades

FACULTIES

code
name
location
phone_number
dean_id

EMPLOYEES
id
first_name
last_name
email
contract_type
employee_type
faculty_code
campus_code
birth_place_code

USERS

username
password_hash
role
student_id
employee_id
is_active
created_at

STUDENTS

id
first_name
last_name
email
birth_date
birth_place_code
campus_code

AREAS

code
name
faculty_code
coordinator_id

PROGRAMS

code
name
area_code

CONTRACT_TYPES

name

EMPLOYEE_TYPES

name

CITIES

code
name
dept_code

DEPARTMENTS

code
name
country_code

CAMPUSES

code
name
city_code

ENROLLMENTS

student_id
nrc
enrollment_date
status

PROGRAMS

code
name
area_code

SUBJECTS

code
name
program_code

GROUPS

nrc
number
semester
subject_code
professor_id

Relationships

FACULTIES

One to many con employees: faculty_code
One to many con areas: faculty_code

EMPLOYEES

One to one con faculties: dean_id
One to many con users: employee_id
One to one con areas: coordinator_id
One to many con groups: professor_id

USERS

STUDENTS

One to many con users: student_id
One to many con enrollments: student_id

CAMPUSES

One to many con employees: campus_code
One to many con students: campus_code

AREAS

One to many con programs: area_code

CONTRACT_TYPES

One  to many con employees: contract_type

EMPLOYEE_TYPES

One to many con employee: employee_type
CITIES

One to many con employees: birth_place_code
One to many con campuses: city_code
One to many con students: birth_place_code

DEPARTMENTS

One to many con cities: dept_code

COUNTRIES

One to many con departments: county_code
One to many con subjects: program_code

SUBJECTS

One to many con groups: subject_code

GROUPS

One to many con enrollments: nrc
