
**Final Year Project Management System**

This Final Year Project Management System is a web-based application developed for the University of Gondar to streamline and digitize the management of undergraduate final year projects. The system is developed using the Laravel framework for the backend and modern frontend technologies for an interactive user experience.
The platform is designed to improve communication, supervision, project tracking, evaluation, and document management between students, advisors, coordinators, and department administrators. Traditionally, final year project activities are managed manually, which can lead to delays, poor communication, document loss, and inefficient monitoring. This system automates the entire workflow to ensure efficiency, transparency, and accessibility.

**Main Features**
Student project registration and proposal submission
Advisor assignment and approval workflow
Project progress tracking and milestone management
File and document upload system
Communication between students and supervisors
Project evaluation and grading management
Department coordinator dashboard and reporting
User authentication and role-based access control
Notification and status update system
Centralized database for project records
**Technologies Used**
**Backend**
Laravel
PHP
RESTful APIs
**Frontend**
React.js / Vite
JavaScript
Tailwind CSS or Bootstrap
**Database**
MySQL

**project structure**
PROJECT-MANAGEMENT/
│
├── backend/    → Laravel API/backend
├── frontend/   → Frontend app 
└── .gitignore
----Cloning------
git clone https://github.com/netsi-YD/project-management.git
cd project-management
cd backend
cp .env.example .env
php artisan key:generate
---Edit .env fuile----
DB_DATABASE="project_managment" /* name as needed*/
DB_USERNAME=root
DB_PASSWORD=password /* change as needed*/
----Runing Migration----
php artisan migrate
---starting backend----
php artisan serve
---front end---
cd fronend
---install dependencies like npm, react-dom,..
npm install
npm run build
npm install react-icons  
npm install @vitejs/plugin-react --save-dev  

---run it---
npm run dev
