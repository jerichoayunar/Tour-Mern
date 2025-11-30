# Tour-Mern — Codebase Analysis & Technical Documentation

Date: 2025-11-27

## Executive Summary

- **Project Type & Purpose**: MERN-based Tour Booking Management System. Provides public-facing pages for browsing destinations and packages, user authentication (including Google OAuth), booking management, admin dashboards for managing packages, destinations, inquiries, clients and settings, and Cloudinary-backed media uploads.
- **Architecture Style**: Monolithic repository with two apps: `frontend/` (React + Vite) and `backend/` (Node.js + Express + Mongoose). Backend serves JSON REST API under `/api/*`.
- **Technology Stack**: React 19 + Vite, Tailwind CSS, Axios; Node.js + Express, Mongoose (MongoDB), JWT auth, Cloudinary uploads, Nodemailer, Winston logging.
- **Scale Assessment**: Medium. Code is organized and modular; ready for SMB production. Lacks infra for large-scale traffic (no Redis, no job queue, no orchestration or CI present).

---

## 1. Technology Stack Breakdown

### FRONTEND
- Framework: React (`react` ^19.1.1)
- Build Tools: Vite (`vite`)
- Styling: Tailwind CSS (`tailwindcss`), PostCSS
- State Management: React Contexts (`AuthContext`, `BookingContext`, `SettingsContext`) and custom hooks
- Routing: `react-router-dom`

### BACKEND
- Runtime: Node.js (ES Modules enabled via `type: module`)
- Framework: Express
- Database: MongoDB (Mongoose ODM)
- ORM/ODM: Mongoose
- Authentication: JWT + `bcryptjs` for password hashing; Google OAuth via `google-auth-library`

### INFRASTRUCTURE
- Deployment: No `Dockerfile` or `docker-compose.yml` found (manual deploy expected)
- CI/CD: No workflows detected (GitHub Actions / GitLab CI not present)
- Monitoring: Winston logging present; no APM integrations
- Testing: No test framework configured in `package.json`; repo contains `backend/tests/` but no runner configured

---

## 2. Architecture Deep Dive

### Frontend Architecture

- **Structure**: Feature-based pages under `frontend/src/pages/` split into `user/` and `admin/`. Reusable logic in `frontend/src/services/`, contexts in `frontend/src/context/`, and hooks in `frontend/src/hooks/`.
- **State Flow**: Global providers wrap `App` in `src/main.jsx` — `ToastProvider`, then `AuthProvider`, then `App`. Components call services which call the `api` Axios instance; responses update contexts or local state.
- **Routing**: `react-router-dom` used for route definitions inside `App.jsx` (config-based routing, not file-system).
- **API Integration**: `frontend/src/services/api.js` creates an Axios instance with base URL from `VITE_API_URL` defaulting to `http://localhost:5000/api`. Request interceptor attaches `Authorization: Bearer <token>` from `localStorage`.
- **Assets**: Static assets under `frontend/public/` and `frontend/src/assets/`. Vite handles dev and build asset management; Tailwind provides utility classes.

### Backend Architecture

- **API Design**: RESTful endpoints under `/api`. Route modules live in `backend/routes/` and controllers in `backend/controllers/`. Naming is resource-centric (e.g., `/api/packages`, `/api/bookings`).
- **Database Layer**: Mongoose models in `backend/models/`. Example: `User.js` supports local & Google login, password hashing, account lockout, soft-archive fields, and indexes.
- **Business Logic**: Controllers delegate heavy logic to `backend/services/` (e.g., `authService`, `bookingService`, `uploadService`). This decouples HTTP handling from core logic.
- **Middleware Chain**: `helmet` (CSP configured), `cors` with whitelist, `compression`, rate limiters on `/api` and `/api/auth` routes, `recaptchaMiddleware` on public endpoints, `validateMiddleware` (Joi), `authMiddleware` (JWT), and `errorMiddleware`.
- **File Organization**: Clear separation: `config/`, `controllers/`, `models/`, `routes/`, `services/`, `middleware/`, `utils/`.

---

## 3. File-by-File (Major Directories)

### `frontend/`
- `package.json` — Vite scripts: `dev`, `build`, `preview`.
- `src/main.jsx` — bootstraps React app with providers.
- `src/App.jsx` — application routes and layout (protects admin routes via `AuthContext`).
- `src/services/` — `api.js` (Axios instance), `authService.js`, `userService.js`, `packageService.js`, `bookingService.js`, `destinationService.js`, `inquiryService.js`, `settingsService.js`.
- `src/context/` — `AuthContext.jsx`, `ToastContext.jsx`, `SettingsContext.jsx`, `BookingContext.jsx`.
- `src/pages/` — split `user/` and `admin/` pages (Auth, Profile, Home, Packages, Bookings, Dashboard, ManageUsers, ManagePackages, ManageInquiries, Settings).

### `backend/`
- `package.json` — scripts: `start` and `dev` (nodemon). Key dependencies listed earlier.
- `server.js` — entrypoint: loads env, sets Helmet/CSP, CORS, compression, registers routes and global error handler, connects to MongoDB via `config/db.js`, ensures admin user exists via `utils/createAdmin.js`.
- `config/db.js` — Mongoose connection helper using `process.env.MONGO_URI`.
- `models/` — `User.js`, `Package.js`, `Booking.js`, `Destination.js`, `Inquiry.js`, `Activity.js`, `Settings.js` — canonical data definitions.
- `routes/` — domain routing files; `authRoutes.js` manages register/login/forgot/reset/change-password/logout and Google OAuth endpoints.
- `controllers/` — request handlers that call `services/` and return JSON responses.
- `services/` — business logic, external integrations (Cloudinary, emails).
- `middleware/` — `authMiddleware.js`, `errorMiddleware.js`, `rateLimit.js`/`rateLimitMiddleware.js`, `recaptchaMiddleware.js`, `validateMiddleware.js`.

---

## 4. Data Flow Analysis

### Client-Side Data Flow
```
User Action → Component → Service → `api` (Axios) → HTTP Request → Backend Response → Service returns data → Context/local state update → UI re-render
```

### Server-Side Data Flow
```
HTTP Request → CORS/Helmet → Rate Limiter → Recaptcha/Validation → Auth Middleware (if protected) → Controller → Service → Mongoose DB operations / External calls → Controller Response → Error Handler
```

### State Management
- Global: `AuthContext`, `BookingContext`, `SettingsContext`, `ToastContext`.
- Local: component-level React state for forms and UI.
- Server State: MongoDB canonical state; no external caching detected.
- Persistence: Frontend stores JWT in `localStorage`; backend relies on JWT verification in `authMiddleware`.

---

## 5. Development Workflow

- **Run locally**
  - Backend: `cd backend && npm install && npm run dev`
  - Frontend: `cd frontend && npm install && npm run dev`

- **Environment**
  - Backend expects `MONGO_URI`, `JWT_SECRET`, Cloudinary and email credentials, Google OAuth keys, and `FRONTEND_URL`.
  - Frontend uses Vite envs like `VITE_API_URL` and `VITE_RECAPTCHA_SITE_KEY`.

- **Testing**
  - No test runner configured. Recommend adding Jest + Supertest for backend, React Testing Library or Vitest for frontend, and Cypress for E2E.

- **Deployment**
  - Frontend builds to static assets (`vite build`). Backend runs `node server.js` (no build). No `Dockerfile` or CI present.

---

## 6. Key Configuration Files

- `backend/package.json` — lists dependencies used by backend.
- `frontend/package.json` — Vite + React dependencies.
- `server.js` — expresses the global server configuration (CSP in `helmet`, CORS whitelist, compression, routes mounting).
- `config/db.js` — MongoDB connection helper.
- Missing but recommended: `.env.example`, `Dockerfile`, `docker-compose.yml`, `.github/workflows/*`.

---

## 7. Dependency Analysis

- Core libraries: `react`, `vite`, `tailwindcss`, `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`.
- Observations: No testing frameworks or CI dependencies; add `jest`, `supertest`, `cypress`, `vitest` as needed.

---

## 8. Security Analysis

- **Auth**: Passwords hashed with bcrypt; JWT used for API access; Google OAuth supported.
- **Good Practices**: Helmet, CSP, rate limiting, Recaptcha, Joi validation.
- **Concerns**:
  - JWT stored in `localStorage` (XSS risk); consider httpOnly cookies + refresh token cycle.
  - CSP currently allows `'unsafe-inline'` for `scriptSrc` which reduces CSP effectiveness.
  - No HTTPS enforcement in `server.js` (should be handled at reverse proxy/load-balancer in production).
  - No `.env.example` for developers; secret handling unclear.

---

## 9. Performance Considerations

- **Frontend**: Use code-splitting / lazy imports for admin dashboards, analytics (Recharts) and large components. Bundle analysis via Vite build tools.
- **Backend**: DB indexing present in `User.js`. Add Redis for caching read-heavy endpoints and cluster-safe rate-limiting.
- **Scaling**: Horizontally scale Express behind a load balancer; use shared Redis for rate-limiting if running multiple instances.

---

## 10. Potential Issues & Improvements

- **Immediate improvements**:
  - Add `.env.example` and `README.md` with env requirements.
  - Implement refresh-token pattern with httpOnly cookies.
  - Remove `'unsafe-inline'` from CSP; use nonces/hashes for necessary inline scripts.
  - Add `Dockerfile` and `docker-compose.yml` for reproducible local dev.
  - Add CI pipeline to run lint and tests on PRs.

- **Longer-term**:
  - Add Redis for caching, queuing (BullMQ), and central rate-limit store.
  - Add automated tests (unit/integration/E2E).
  - Consider splitting heavy workloads into workers/microservices if scaling needs grow (e.g., email, image processing).

---

## 11. Getting Started (Quick Guide)

1. Clone: `git clone <repo> && cd tour-mern`
2. Backend setup:
   - `cd backend`
   - Create `.env` with at least `MONGO_URI`, `JWT_SECRET`, Cloudinary and email credentials, `FRONTEND_URL`
   - `npm install`
   - `npm run dev`
3. Frontend setup:
   - `cd ../frontend`
   - `npm install`
   - set `VITE_API_URL` in `.env` if not using default
   - `npm run dev`

**Common env vars (example)**
```
MONGO_URI=mongodb://localhost:27017/tourdb
PORT=5000
JWT_SECRET=replace_this
FRONTEND_URL=http://localhost:5173
-- Cloudinary keys --
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
-- Email SMTP --
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```

---

## 12. Next Actions (recommended)

- Add `.env.example` and a short `README.md` with run steps.
- Create a `Dockerfile` + `docker-compose.yml` for dev.
- Add basic test scaffolding (Jest + Supertest backend, Vitest or RTL frontend) and a GitHub Actions workflow to run them.
- Implement refresh-token + httpOnly cookie auth flow.

---

If you'd like, I can now:

- Create `.env.example` and `README.md`.
- Scaffold `Dockerfile` + `docker-compose.yml`.
- Add a basic GitHub Actions workflow and a sample test.

Which should I do next?
