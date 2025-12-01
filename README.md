# Tour-MERN — Tour Booking & Management System

> A full-featured MERN (MongoDB, Express, React, Node) tour booking and management system — with local + OAuth authentication, bookings, client & inquiry management, admin dashboard, activity logs, and utilities for backup/export.

- ✨ Production-ready structure for rapid customization
- ⚙️ Clean separation between controllers, services, models, and routes
- 🛡️ Built-in JWT + Google/GitHub OAuth support

---

## Key Features

- Authentication: Local (email/password) + Google & GitHub OAuth
- Role-based access: Admin and User roles
- Tour packages: List, filter, detail views, tagging
- Bookings: Multi-package selection, booking lifecycle, email notifications
- Client & Inquiry management: CRUD + search
- Admin dashboard: Analytics, activity logs, settings
- Utilities: Backup/export scripts, export to Drive, scheduled jobs
- REST API: Well-structured controllers/services/routes

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, React Router, TailwindCSS, Axios, Vite |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, Google OAuth, GitHub OAuth |
| Email | Nodemailer (or third-party provider like SendGrid) |
| Deployment | Vercel/Netlify (frontend), Render/Railway/AWS (backend) |

![Repo Size Badge](https://img.shields.io/badge/repo-Tour--MERN-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D14-brightgreen)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.2-4ea94b)

---

## Screenshots

> Replace the placeholder paths with actual screenshots in `docs/screenshots/`.

- Landing Page: `docs/screenshots/landing.png`
- Package List: `docs/screenshots/packages.png`
- Booking Flow: `docs/screenshots/booking.png`
- Admin Dashboard: `docs/screenshots/admin.png`

---

## Project Folder Structure (high-level)

```
tour-mern/
  frontend/            # React app (Vite)
  backend/             # Express API, controllers, services, models
  docs/                # Project documentation
  scripts/             # Helpful scripts
```

Detailed (selected):

```
backend/
  controllers/        # Route handlers
  services/           # Business logic
  models/             # Mongoose schemas
  routes/             # Express routes
  middleware/         # Auth, rate-limit, validation
  config/             # DB and OAuth configs
  server.js

frontend/
  src/
    components/
    pages/
    api/               # axios wrappers
    styles/            # Tailwind + custom CSS
  index.html
```

---

## Installation & Setup

Prerequisites:

- Node.js 14+ and npm/yarn
- MongoDB 4.2+ (local or Atlas)
- (Optional) Google/GitHub OAuth credentials

1. Clone the repo

```powershell
git clone https://github.com/jerichoayunar/Tour-Mern.git
cd Tour-Mern
```

2. Install dependencies

```powershell
# backend
cd backend; npm install

# frontend
cd ../frontend; npm install
```

3. Copy environment files and fill values

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

4. Start development servers

```powershell
# backend
cd backend
npm run dev

# frontend (new terminal)
cd frontend
npm run dev
```

---

## Environment Variables Sample (`backend/.env.example`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/tour-mern

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=supersecret

# Misc
FRONTEND_URL=http://localhost:3000
```

Add a matching `frontend/.env.example` for any runtime overrides (e.g., `VITE_API_BASE_URL`).

---

## API Endpoints Overview (high level)

Base URL: `http://localhost:5000/api`

| Area | Endpoint | Methods | Description |
|---|---:|---:|---|
| Auth | `/auth/register` | POST | Register user |
| Auth | `/auth/login` | POST | Login - returns JWT |
| Auth | `/auth/google` | GET/POST | Google OAuth flow |
| Users | `/users` | GET/POST | Create/get users (admin) |
| Packages | `/packages` | GET/POST | List/create packages |
| Packages | `/packages/:id` | GET/PUT/DELETE | Package details/manage |
| Bookings | `/bookings` | POST/GET | Create booking / list bookings |
| Bookings | `/bookings/:id` | GET/PUT/DELETE | Manage booking |
| Inquiries | `/inquiries` | CRUD | Client inquiries |
| Admin | `/admin/stats` | GET | Dashboard analytics (admin) |

For full details see `docs/api.md`.

---

## How Authentication Works

- Local: Users sign up with email & password. Passwords are hashed (bcrypt) before storing. On login the server returns a signed JWT which the frontend stores (e.g., `localStorage`) and attaches to API requests in the `Authorization: Bearer <token>` header.
- OAuth: Google/GitHub OAuth is supported. The server exchanges provider tokens for a local account and issues a JWT.
- Refresh tokens: Not implemented by default; token rotation can be added if needed.

---

## How Booking System Works

- Users choose one or more packages and submit a booking request.
- Backend creates a `Booking` document containing package references, client info, dates, totals, and status (pending/confirmed/cancelled).
- Upon successful booking, an email confirmation is sent using configured email provider.
- Admins can view, confirm, or cancel bookings via admin endpoints or dashboard UI.

---

## How Admin Dashboard Works

- Admin users have elevated role claims. Admin-only routes are protected by middleware that verifies JWT and role.
- Dashboard aggregates data from Bookings, Users, Packages and Activity Logs to present charts and KPIs.

---

## Running in Production

- Build frontend: `cd frontend && npm run build` (deploy static output to Vercel/Netlify or serve via Node/static server)
- Backend: Use a process manager (PM2) or host on Render/Railway/AWS with environment variables set. Ensure HTTPS, correct CORS, and DB network access.

Example with PM2:

```powershell
# install pm2 globally
npm i -g pm2
cd backend
pm2 start server.js --name tour-mern-api --env production
```

---

## Troubleshooting (quick)

- MongoDB connection refused: check `MONGO_URI`, ensure MongoDB is running and accessible.
- CORS errors: confirm `FRONTEND_URL` and backend CORS config.
- OAuth redirect mismatch: ensure provider redirect URIs match production/dev URLs.
- JWT expiration: check `JWT_EXPIRES_IN` and system clocks.

More details in `docs/troubleshooting.md`.

---

## License

This project is released under the MIT License. See `LICENSE` for details (add license file as needed).

---

If you'd like, I can also:
- Add a `LICENSE` file
- Wire up a sample `frontend/.env.example` and a basic CI workflow

Happy to continue — tell me which next step you prefer.
