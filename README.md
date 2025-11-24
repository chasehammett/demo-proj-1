# Fullstack User Management App
A full-stack, TypeScript-powered user management system built with **React + Vite + MUI** on the frontend and **Node.js + Express + Prisma + PostgreSQL** on the backend. Includes authentication, admin-protected routes, sorting, pagination, and CRUD operations.

---

## 🚀 Getting Started (Run Locally)

### Prerequisites
Make sure you have installed:

- **Node.js** (v18+ recommended)
- **PostgreSQL** (local DB or Docker)
- **npm** or **yarn**

---

# 📦 Backend Setup
Located in: `backend/`

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Create a `.env` file
```
DATABASE_URL="postgresql://appuser:apppass@localhost:5432/appdb?schema=public"
JWT_SECRET="supersecretjwt"
PORT=4000
```

### 3. Start PostgreSQL
Either run postgres locally or use Docker:
```bash
docker run --name appdb -e POSTGRES_USER=appuser   -e POSTGRES_PASSWORD=apppass   -e POSTGRES_DB=appdb   -p 5432:5432 -d postgres:16
```

### 4. Apply Prisma migrations
```bash
npx prisma migrate dev --name init
```

### 5. Seed an admin user
```bash
npx ts-node scripts/seed.ts
```
Creates:
- Email: `admin@demo.dev`
- Password: `Admin123!`
- Role: `ADMIN`

### 6. Run the backend
```bash
npm run dev
```

Your API is now running at:
```
http://localhost:4000/api
```

---

# 💻 Frontend Setup
Located in: `frontend/`

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Create `.env`
```
VITE_API_URL="http://localhost:4000/api"
```

### 3. Run the frontend
```bash
npm run dev
```

App will be available at:
```
http://localhost:5173/
```

---

# 🔐 Login Credentials (Default)
After running the seed script:
```
Email: admin@demo.dev
Password: Admin123!
Role: ADMIN
```

---

# ✨ Current Features

### 🔑 Authentication
- Login with JWT
- Token persisted with localStorage
- Axios interceptor automatically attaches token
- Auto-logout & redirect on 401

### 👤 User Management (Admin Only)
- List all users
- Search by name or email
- Pagination (server-side)
- Sorting (name, email, role, createdAt)
- Delete a user
- Create a new user (email, name, role)
- Edit existing users (name + role)

### 🎨 UI
- Material UI
- Mobile responsive
- Role chips
- Toast notifications
- Dialog forms

### 🗃 Backend Architecture
- Prisma ORM
- PostgreSQL
- Zod validation
- Role-based auth middleware
- Secure password hashing (bcrypt)
- Typed REST API

---

# 🧱 Tech Stack

### Frontend
- React (TypeScript)
- Vite
- Material UI
- Axios
- React Router

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- JWT

---

# 📁 Project Structure
```
fullstack-users/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── scripts/
│   └── .env
│
└── frontend/
    ├── src/
    └── .env
```

---

# 🚀 Future Improvements
- React Query
- Audit logs
- Unit/integration tests
- Docker Compose
- Deployment: Render/Railway/Vercel
- More granular RBAC
- Dark/light mode toggle

---

# 📜 License
MIT
