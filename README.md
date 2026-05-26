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
