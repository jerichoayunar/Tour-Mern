3.5 Integration Strategies

Overview

This section describes how the project’s frontend, backend, database, authentication layer, and external services integrate to deliver application functionality. The content is grounded in repository evidence and references key modules and configuration files to help developers locate integration points quickly.

3.5.1. API Integrations and Interactions

Internal REST API

The backend exposes a resource-oriented REST API consumed by the React frontend and other potential clients. Route modules under `backend/routes` are registered in `backend/server.js` (for example: `authRoutes`, `bookingRoutes`, `packageRoutes`, `destinationRoutes`, `inquiryRoutes`, `userRoutes`, `adminRoutes`, `activityRoutes`, `settingsRoutes`, `adminSettingsRoutes`).

Responsibilities

- Validate and authorize incoming requests.
- Apply business logic in controllers and service modules.
- Perform persistence operations via Mongoose models in `backend/models`.
- Trigger side-effects such as emails and media uploads.

Transport and payloads

- Standard interactions use HTTPS with JSON payloads and standard HTTP verbs (GET, POST, PUT, DELETE).
- Media uploads use `multipart/form-data` and are handled using `multer` and a Cloudinary storage adapter.

Authentication and authorization

- Google OAuth: The repository initializes an OAuth client in `backend/config/googleOAuth.js`. The backend performs server-side token exchanges and maps provider profiles to local users during OAuth login flows.
- JWT: Token-based authentication is used; secret keys are stored in environment files (`backend/.env` and `backend/.env.example`). Tokens are validated in authentication middleware to protect routes.

Third-party integrations

- Email (SMTP via Nodemailer): Implemented in `backend/services/emailService.js`. Used for password resets, booking confirmations, and inquiry responses. The transporter reads SMTP settings from environment variables such as `EMAIL_HOST`, `EMAIL_USER`, and `EMAIL_PASS`.
- Cloudinary (media storage): Configured in `backend/utils/cloudinary.js` and enabled via packages in `package.json` (`cloudinary`, `multer`, `multer-storage-cloudinary`). Backend endpoints accept files from the frontend, stream them to Cloudinary, and persist returned URLs in the database.
- Google reCAPTCHA: Server-side token verification is implemented in `backend/services/recaptchaService.js`. It protects public form submissions (e.g., inquiry and sign-up flows) by validating tokens with Google’s verification endpoint.

Interaction patterns

- Frontend directly calls backend endpoints (HTTPS + JSON). The backend performs authoritative validation and then accesses the database or external services as needed.
- For operations involving external providers (uploads, OAuth), the backend acts as an intermediary, handling provider-specific protocols and returning normalized responses to the frontend.

3.5.2. Integration of Subject Components

Primary components and responsibilities

- Frontend (`React`): Renders UI, performs client-side validation, manages local state and routing, and initiates API calls.
- Backend (`Node` + `Express`): Implements API routes and controllers, centralizes business rules, enforces security, and integrates with external services via service modules in `backend/services` and utilities in `backend/utils`.
- Database (`MongoDB` via `Mongoose`): Stores domain entities (users, bookings, packages, destinations, activities, inquiries, settings). Models are authoritative for data shape and constraints.
- Authentication: Combination of local authentication and Google OAuth. Authentication middleware enforces protected routes and attaches user context to requests.
- External services: Email (SMTP), Cloudinary (media), Google OAuth, Google reCAPTCHA. These are encapsulated behind service modules to isolate provider-specific logic.

Dependencies and typical flows

- User → Frontend → Backend route → Controller → Service(s) → Database / External API → Controller response → Frontend update.
- File uploads: Frontend → Backend upload endpoint (multipart/form-data) → Cloudinary (via `multer-storage-cloudinary`) → Backend saves asset URL → Frontend receives metadata.
- OAuth login: Frontend redirects to provider → Provider redirects back with code → Backend exchanges code for tokens, resolves user, and issues a local session or JWT.

Integration benefits

- Encapsulation: Service modules (email, uploads, reCAPTCHA) provide stable internal APIs and hide provider details from controllers.
- Centralized business logic: The backend enforces rules and validation to maintain consistent behavior regardless of client.

3.5.3. Data Flow and Communication

End-to-end flow (representative example)

1. User triggers an action in the frontend (search, booking, form submission).
2. Frontend validates input and sends an HTTP request to the backend (JSON or multipart/form-data).
3. Backend authenticates the request (if necessary) and validates payloads using middleware and schema rules.
4. Backend applies business logic: reads/writes to MongoDB, checks constraints, and coordinates external APIs for side-effects.
5. Backend persists data and triggers any required side-effects (email notifications, media uploads).
6. Backend returns a JSON response describing success or failure; the frontend updates the UI accordingly.

Protocols and formats

- REST over HTTPS: Primary protocol between frontend and backend. Responses use standard HTTP status codes. JSON is the default payload format.
- Multipart/form-data: Used for binary uploads. The server uploads binary content to Cloudinary and records returned URLs.
- Server-to-server HTTP: Used for reCAPTCHA verification, OAuth token exchanges, and other provider interactions.

Validation and error handling

- Dual-layer validation: client-side checks for immediate feedback and server-side validation for authoritative enforcement. Server-side validation runs before any mutation to the database.
- Error responses include meaningful HTTP status codes and JSON bodies with concise messages and error identifiers that the frontend can map to user-facing feedback.

Observability and operational notes

- Startup checks: The email service verifies transporter readiness on startup and logs diagnostic messages (`backend/services/emailService.js`).
- Rate limiting: Global and auth-specific rate limiters are applied in `backend/server.js` to protect endpoints from abuse.
- Security middleware: `helmet`, `cors`, and content security policies are configured in `backend/server.js` to control resource access and trusted origins.

Beginner-friendly summary

- The React frontend sends structured requests to the Node/Express backend. The backend validates, enforces rules, and stores or retrieves data from MongoDB. External services (email, Cloudinary, OAuth, reCAPTCHA) are accessed server-side through encapsulated service modules. Data is exchanged primarily as JSON over HTTPS, with binary uploads handled via multipart/form-data.

References (key files and locations)

- `backend/server.js` — application entry, global middleware, and route registration
- `backend/routes/*.js` — route definitions per resource
- `backend/controllers` — controllers implementing business actions
- `backend/services/emailService.js` — SMTP integration and email templates
- `backend/utils/cloudinary.js` — Cloudinary configuration and storage adapter
- `backend/config/googleOAuth.js` — OAuth client configuration
- `backend/services/recaptchaService.js` — reCAPTCHA verification implementation
- `backend/.env` and `backend/.env.example` — keys and configuration values for OAuth, JWT, Cloudinary, email, and reCAPTCHA

Notes

- This document focuses on integration patterns and responsibilities rather than endpoint-level details. For endpoint definitions, schema diagrams, or sequence diagrams, see the API reference and model documentation in the project repository.

---

3.5 Integration Strategies (Classmate-style Applied)

3.5.1. API Integrations and Interactions

1. Google Authentication API (present)
	- Purpose: Enables secure login through Google accounts (SSO). The repository initializes an OAuth client in `backend/config/googleOAuth.js` to exchange authorization codes and retrieve user profile information. The backend maps provider profiles to local user records and issues a session token (JWT) for subsequent requests.

2. reCAPTCHA API (present)
	- Purpose: Mitigates bot and automated abuse for public forms. Server-side verification is implemented in `backend/services/recaptchaService.js`. Frontend supplies a `recaptchaToken`; backend validates with Google to permit or reject the action.

3. Google Calendar API (optional / not currently implemented)
	- Note: The current repository does not include Google Calendar integration. This API may be introduced to manage availability and booking schedules (recommended enhancement for calendar-based features).

4. Email Notification API (present)
	- Purpose: Sends transactional emails (password reset, booking confirmations, status changes, inquiry responses). Implemented with Nodemailer in `backend/services/emailService.js`. Templates and triggers are invoked from controllers after booking/inquiry/password events.

5. PDF Report Generation API (optional / not currently implemented)
	- Note: The repository does not include a PDF generation service. If required, a server-side PDF generation service (e.g., Puppeteer, PDFKit, or a hosted API) can be integrated to produce booking summaries and admin reports.

6. Cloudinary API (present)
	- Purpose: Stores, transforms, and serves media assets for destinations, packages, and activities. Configured in `backend/utils/cloudinary.js` and used with `multer-storage-cloudinary` to accept uploads, optimize images, and return hosted URLs persisted in MongoDB.

7. Google Sheets API (optional / not currently implemented)
	- Note: Not present in the codebase. Google Sheets can be added for export and collaborative reporting tasks if administrators need spreadsheet-based workflows.

8. HTML File QR Code Scanner API (optional / not currently implemented)
	- Note: No evidence of a QR scanning service in the repository. A QR scanning integration (camera-based or server-side HTML parsing) can be added to support on-site verification and check-in workflows.

Summary
 - Present integrations in this repository: Google OAuth, reCAPTCHA, Nodemailer (SMTP), Cloudinary, JWT-based auth and middleware for securing endpoints. Optional integrations (Calendar, PDF, Sheets, QR) are listed for future extension and are not currently implemented in the codebase.

3.5.2. Integration of Subject Components

Collaboration and responsibilities
 - Frontend (React): Handles user interaction, input validation, and state management. It issues HTTPS requests to backend routes (registered in `backend/server.js`) and presents data returned by the API.
 - Backend (Node/Express): Centralizes business logic, enforces validation and authorization, and orchestrates persistence and external integrations. Routes delegate to controllers (in `backend/controllers`) that use service modules for provider interactions (`backend/services`, `backend/utils`).
 - Database (MongoDB via Mongoose): Stores domain entities—users, bookings, packages, destinations, activities, inquiries, settings—under `backend/models`.
 - Authentication: Google OAuth for social login and JWT for session management and route protection (secrets in `backend/.env`). Authentication middleware attaches user context to requests and enforces role-based access.
 - External Services: Email (SMTP), Cloudinary (media), Google reCAPTCHA. Each service is encapsulated by a module that provides a focused, testable interface for controllers.

Dependencies and integration interfaces
 - The frontend depends on backend REST endpoints for data and actions. The backend depends on the database and external providers (email, Cloudinary, reCAPTCHA) to complete workflows.
 - Integration interfaces are HTTP-based (REST or server-to-server API calls) and file-streaming for uploads. Encapsulation via service modules minimizes the impact of provider changes.

3.5.3. Data Flow and Communication

Protocol and formats
 - REST over HTTPS with JSON payloads is the primary communication channel between frontend and backend. Standard HTTP verbs are used (GET, POST, PUT, DELETE) and status codes indicate outcomes.
 - Binary uploads use `multipart/form-data`; the backend uses `multer` plus the Cloudinary storage adapter to stream files to Cloudinary and persist returned URLs.
 - Server-to-server HTTPS calls are used for reCAPTCHA verification and OAuth token exchanges.

Authentication Flow (Google OAuth + JWT)
 - Google OAuth Flow (high level):
	• Client initiates Google sign-in; provider returns an authorization code or token.
	• Backend verifies the code/token with Google's endpoints (configured in `backend/config/googleOAuth.js`).
	• Backend creates or updates the corresponding local user record and issues a JWT to the client.
 - JWT Flow:
	• The client attaches the JWT to protected requests (typically in the `Authorization` header).
	• Authentication middleware validates the token and enforces role-based access control.
	• If a token is invalid or expired, the backend returns a 401 Unauthorized response.

Core data flows (adapted to this system)

1. Booking Management Flow
	- Creation:
	  • User submits booking data from the frontend (customer details, selected packages, dates).
	  • Backend validates payloads, checks availability, and enforces business rules in controllers.
	  • Booking is persisted to MongoDB; a confirmation email is queued/sent via `emailService`.
	  • Response containing booking details is returned to the frontend.
	- Retrieval and updates follow standard REST patterns (list, get-by-id, update status, cancel).

2. User Management Flow
	- Registration and login:
	  • Local registration or Google OAuth creates a user record with role assignments.
	  • Email validation and password reset flows are supported via `emailService`.
	- Permissions and sessions:
	  • Role-based access control (RBAC) enforced by middleware. User data is stored in MongoDB and referenced by bookings and other domain objects.

3. Media Upload Flow
	- Admin uploads images via the frontend; multipart/form-data is sent to the backend.
	- Backend stores files in Cloudinary via `multer-storage-cloudinary`; returned URLs are recorded in the database and returned to the frontend.

4. Inquiry and Public Form Flow
	- Public forms (inquiries) include a `recaptchaToken` from the client.
	- Backend validates reCAPTCHA before persisting inquiries and sending email notifications.

Communication protocols, validation, and formats
 - JSON is the primary data interchange format. IDs are transmitted as strings; dates use ISO formats.
 - Validation: client-side for UX; server-side (middleware and controllers) for authoritative checks. Schema-level validation ensures expected data formats before persistence.
 - Error handling: Errors are normalized into JSON responses with HTTP status codes and concise messages. Global error middleware centralizes logging and response formatting.

Real-time and asynchronous patterns
 - The current codebase relies on synchronous request/response patterns and background side-effects (emails). For near-real-time updates, the application can adopt polling or WebSocket-based push (not currently implemented).

Error handling and logging
 - Client-side validation prevents simple mistakes; server-side validation and the global error handler provide robust safeguards.
 - Critical services (email transporter) perform startup verification and emit logs (`backend/services/emailService.js`). The server uses middleware for rate limiting and security headers (`backend/server.js`).

Security measures
 - CORS, Helmet, and CSP rules are configured in `backend/server.js` to control allowed origins and resources.
 - JWT-based authentication and role checks protect sensitive routes. Inputs are validated and sanitized to reduce injection risk.
 - Rate limiting middleware reduces abuse on public endpoints (configured in `backend/middleware/rateLimit.js`).

Notes and next steps
 - Optional features (Google Calendar, Google Sheets, PDF generation, and QR scanning) are not currently present. If these are required, integration points and service modules should be added to `backend/services` with appropriate environment configuration values in `.env` and documented in this file.
 - If you want, I can add a compact sequence diagram (Mermaid) and a short change log for inclusion in `BACKEND_DOCUMENTATION.md`.

Chapter 4
SECURITY POLICY (code-referenced)

This chapter documents the security controls implemented in the repository and points to the exact files, environment variables, and areas where controls are present or recommended. It replaces high-level policy statements with code references so developers and auditors can quickly verify implementation.

4.1. IS Policy Document

4.1.1. Hardware Security Policy
- Responsibility: not implemented in code. Operational controls (device hardening, disk encryption, firewall configuration) are expected to be enforced by the deployment / hosting environment and operations team.

4.1.2. Software Security Policy (implemented / referenced files)
- Password storage: implemented in `backend/models/User.js` — passwords are hashed using `bcrypt` in the schema `pre('save')` hook.
- Authentication: implemented using JWT in `backend/middleware/authMiddleware.js` (see `protect` middleware). Tokens are verified with `process.env.JWT_SECRET`.
- Role-based access control (RBAC): enforced by `backend/middleware/authMiddleware.js` via `authorize(...roles)` and the `admin` convenience middleware. Many routes apply RBAC, for example `backend/routes/activityRoutes.js` and other route files that call `router.use(authorize('admin'))`.
- Social login: Google OAuth client configuration is in `backend/config/googleOAuth.js` and the login flow is handled in `backend/services/googleAuthService.js` (new Google users are assigned a default role in that service).
- Input validation & sanitization: request validation is implemented via `backend/validations/*` and used in route definitions (for example, `backend/routes/authRoutes.js` imports Joi schemas from `backend/validations/authValidation.js`).
- HTTPS / transport security: TLS termination is typically performed by the hosting layer (reverse proxy / cloud). The application sets secure headers and CSP via `helmet` in `backend/server.js`.
- Multi-factor authentication (MFA): not implemented in code. If required, integrate an MFA provider and extend `authService` + `authRoutes`.

4.1.3. Network Communications Policy (implemented / referenced files)
- Secure headers & CSP: `backend/server.js` — `helmet` is configured with a content security policy that allows Google OAuth and Cloudinary resources.
- CORS: configured in `backend/server.js` (see `allowedOrigins` and `app.use(cors(...))`).
- Rate limiting: implemented in `backend/middleware/rateLimit.js` and `backend/middleware/rateLimitMiddleware.js`; applied in `backend/server.js` (`app.use('/api/auth', authLimiter)` and `app.use('/api', apiLimiter)`) and also used for specific routes (e.g., `authRoutes` uses `passwordResetLimiter`).
- reCAPTCHA server verification: implemented in `backend/services/recaptchaService.js` and used by public routes that accept `recaptchaToken`.

4.1.4. Data Policy (code evidence and gaps)
- Data model: user and domain models are in `backend/models/*.js`. Notably `backend/models/User.js` includes `archived` fields for soft-delete and role fields used by RBAC.
- Encryption in transit: the application expects TLS termination at the deployment layer; `server.js` does not terminate TLS itself. Ensure `FRONTEND_URL`, `MONGO_URI`, and hosting are configured for HTTPS in production.
- Encryption at rest: not explicitly configured in the application code. If using MongoDB Atlas, enable encryption-at-rest and backups via Atlas console. The repository prints `process.env.MONGO_URI` in `backend/config/db.js` and relies on the database provider for at-rest protections.
- Backups & PITR: not automated in code. Recommend enabling backups (MongoDB Atlas) and document the backup policy in operations runbooks.
- Data retention / deletion: models include `archived` flags (soft delete). Automatic delete-after-2-years is a policy but not implemented as a scheduled job in the repo — implement a scheduled task (cron / serverless function) if automatic purging is required.

4.1.5. Process Policy (how code enforces approvals and auditability)
- RBAC enforcement: routes use `protect` and `authorize(...)`. Examples: `backend/routes/activityRoutes.js` and `backend/routes/packageRoutes.js` apply `router.use(authorize('admin'))` to protect admin-only endpoints.
- Audit logging: structured logging is implemented in `backend/logs/logger.js` using `winston` with daily rotation. Controllers and services call the logger or the global error middleware (`backend/middleware/errorMiddleware.js`) captures and formats errors.
- Email notifications & workflow automation: `backend/services/emailService.js` sends transactional emails (password reset, booking confirmation). Booking flows trigger email helpers in controllers/services.

4.1.6. People Policy (operational notes)
- Training and awareness are organizational policies and not enforced in code. The repository includes `backend/utils/createAdmin.js` to ensure an admin account exists on startup, but staff training and incident response playbooks should be maintained outside code (in `docs/` or an operations runbook).

4.2. IT Security Management Framework

4.2.1. Legal Compliance
- Privacy and compliance are managed by process. The codebase provides hooks to support compliance (e.g., password reset, data export endpoints, soft-delete via `archived` fields). For formal compliance with the Data Privacy Act (RA 10173), implement and document consent flows in the frontend and an audit trail for data export / deletion requests.

4.2.2. Security Governance Standard
- The repository contains operational helpers that support governance:
  - `backend/utils/createAdmin.js` — ensures an initial admin account for governance.
  - `backend/middleware/rateLimit.js` and `backend/logs/logger.js` — support monitoring and incident detection.

Notes / Actionable gaps (recommended):
- MFA: add 2FA flows (TOTP or SMS/email OTP) in `backend/services/authService.js` and `backend/routes/authRoutes.js` if required.
- Encryption at rest: configure MongoDB Atlas encryption and snapshot policies; optionally implement field-level encryption for sensitive fields.
- Automated retention: add a scheduled job (Node cron or cloud scheduler) to enforce the two-year purge policy for inactive accounts.
- Documentation: add a short appendix in `docs/Integration Strategies.md` that lists the exact env variables required for security: `JWT_SECRET`, `MONGO_URI`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RECAPTCHA_SECRET_KEY`, `FRONTEND_URL`, `SUPPORT_EMAIL`.

References (code locations)
- Authentication & RBAC: `backend/middleware/authMiddleware.js`
- User model & password hashing: `backend/models/User.js`
- Google OAuth: `backend/config/googleOAuth.js`, `backend/services/googleAuthService.js`
- reCAPTCHA verification: `backend/services/recaptchaService.js`
- Email (SMTP/Nodemailer): `backend/services/emailService.js`
- Cloudinary uploads: `backend/utils/cloudinary.js`, `backend/services/uploadService.js`, `backend/services/packageService.js`
- Rate limiting: `backend/middleware/rateLimit.js`, `backend/middleware/rateLimitMiddleware.js`, configured in `backend/server.js`
- Security headers & CORS: `backend/server.js`
- Database connection: `backend/config/db.js`
- Logging: `backend/logs/logger.js`

