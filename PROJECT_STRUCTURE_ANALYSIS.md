# MERN Application Structure & Tech Stack Analysis

**Date:** November 19, 2025
**Project:** Tour Booking Management System

---

## **1. PROJECT STRUCTURE**

**Root Directory Organization:**
```
/
├── backend/                # Express.js API Server
├── frontend/               # React + Vite Client Application
├── scripts/                # Utility scripts (e.g., validateEnv.js)
├── .git/                   # Git repository data
└── [Documentation Files]   # (ARCHIVE_SYSTEM_IMPLEMENTED.md, etc.)
```

**Backend Folder Structure (`/backend`):**
```
backend/
├── config/                 # Configuration (db.js, googleOAuth.js)
├── controllers/            # Request handlers (logic layer)
├── middleware/             # Express middleware (auth, error, validation)
├── models/                 # Mongoose schemas (Data layer)
├── routes/                 # API route definitions
├── services/               # Business logic (Service layer pattern)
├── utils/                  # Helper functions (cloudinary, multer, seeders)
├── validations/            # Joi validation schemas
├── logs/                   # Logger configuration
├── server.js               # Entry point
└── package.json            # Dependencies
```

**Frontend Folder Structure (`/frontend`):**
```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   ├── common/         # Shared components (Toast, FormField)
│   │   ├── layout/         # Layout wrappers (Navbar, Footer, Sidebar)
│   │   └── user/           # User-facing components
│   ├── context/            # React Context (Auth, Booking, Settings)
│   ├── hooks/              # Custom React Hooks
│   ├── pages/              # Page components (Route targets)
│   │   ├── admin/          # Admin dashboard pages
│   │   └── user/           # Public/User pages
│   ├── services/           # API integration (axios instances)
│   ├── utils/              # Helper functions
│   ├── App.jsx             # Main Router configuration
│   └── main.jsx            # Application entry point
├── vite.config.js          # Vite configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

---

## **2. BACKEND SPECIFICS**

**Package.json Dependencies:**
*   **Core:** `express` (v4.21.2), `mongoose` (v8.19.2), `dotenv` (v17.2.3), `cors` (v2.8.5)
*   **Auth:** `bcryptjs`, `jsonwebtoken`, `google-auth-library`
*   **File Handling:** `multer`, `multer-storage-cloudinary`, `cloudinary`
*   **Validation:** `joi`
*   **Utilities:** `winston` (logging), `nodemailer` (email), `express-rate-limit`

**File Structure Details:**
*   **Architecture:** Controller-Service-Repository pattern. Controllers delegate business logic to `services/`, keeping controllers lean.
*   **Naming Convention:** camelCase (e.g., `packageController.js`, `packageRoutes.js`).
*   **Models:** Mongoose schemas with validation, timestamps, and indexes (e.g., `Package.js`).
*   **Routes:** Modular routers mounted in `server.js` (e.g., `/api/packages` -> `packageRoutes`).
*   **Middleware:** Custom middleware for Auth (`protect`, `authorize`), Error Handling (`errorHandler`), and Validation (`validateRequest`).

**JavaScript Features:**
*   **Module System:** **ES6 Modules** (`"type": "module"` in package.json).
*   **Async Flow:** Heavy use of **Async/Await** with `try/catch` blocks.
*   **TypeScript:** No TypeScript usage detected in backend.

---

## **3. FRONTEND SPECIFICS**

**Package.json Dependencies:**
*   **Core:** `react` (v19.1.1), `react-dom` (v19.1.1)
*   **Routing:** `react-router-dom` (v7.9.2)
*   **HTTP Client:** `axios` (v1.12.2)
*   **UI/Animation:** `framer-motion`, `gsap`, `lucide-react` (icons)
*   **Charts:** `chart.js`, `react-chartjs-2`, `recharts`
*   **Styling:** `tailwindcss` (v4.1.13)

**Vite Configuration:**
*   Standard Vite setup with `@vitejs/plugin-react` and `@tailwindcss/vite`.

**React Architecture:**
*   **Component Style:** **Functional Components** with Hooks.
*   **State Management:** **Context API** (`AuthContext`, `BookingContext`, `SettingsContext`, `ToastContext`). No Redux/Zustand found.
*   **Routing:** `react-router-dom` with nested routes and protected route wrappers (`ProtectedRoute`).
*   **Hooks:** Custom hooks used for data fetching (e.g., `useDestinations`).

**TailwindCSS Configuration:**
*   **Version:** Tailwind v4.
*   **Custom Theme:** Extended colors (`primary`, `slate`, `emerald`), custom fonts (`Inter`), and custom animations (`fade-in`, `slide-up`).

---

## **4. KEY FILES CONTENT**

**Backend: `server.js` (Entry Point)**
*   Initializes Express, connects to MongoDB, and registers all API routes (`/api/auth`, `/api/packages`, etc.).
*   Includes global error handling and 404 handling.

**Backend: `models/Package.js`**
*   Mongoose schema defining tour packages with fields like `title`, `itinerary` (array), `price`, `duration`, and `image`.
*   Includes `text` indexes for search optimization.

**Frontend: `src/App.jsx`**
*   Sets up the `Router` and wraps the app in multiple Context Providers (`AuthProvider`, `BookingProvider`, etc.).
*   Defines route structure separating Public/User routes from Protected/Admin routes.

**Frontend: `src/services/api.js`**
*   Creates an Axios instance with a base URL.
*   **Interceptors:**
    *   **Request:** Automatically attaches the JWT token from `localStorage`.
    *   **Response:** Global error handling (specifically for 401 Unauthorized).

---

## **5. DEVELOPMENT & BUILD TOOLS**

*   **Runtime:** Node.js.
*   **Package Manager:** npm (indicated by `package-lock.json`).
*   **Build Tool:** Vite (Fast HMR and bundling).
*   **Linting:** ESLint (v9.36.0) with React hooks plugins.
*   **Formatting:** Prettier is likely used (based on code style) but not explicitly in dependencies.
*   **Testing:** No testing framework (Jest/Vitest) found in `package.json` scripts.

---

## **6. CURRENT PERFORMANCE & OBSERVATIONS**

*   **Optimization:**
    *   **Images:** Cloudinary is used for image optimization, which is excellent.
    *   **Code Splitting:** Routes in `App.jsx` are imported directly. Implementing `React.lazy` and `Suspense` for Admin/User modules could improve initial load time.
*   **Security:**
    *   Helmet and Compression middleware are **installed and active** in `server.js`.
    *   Rate limiting is installed (`express-rate-limit`) and applied to `/api` and `/api/auth`.
*   **Architecture:**
    *   The **Service Layer** pattern in the backend is a strong architectural choice, keeping controllers clean and logic reusable.
    *   **Context API** is suitable for this scale, but watch for re-render performance if the app grows significantly.

---

## **7. ADDITIONAL CONTEXT**

*   **Project Type:** Full-featured Tour Booking Management System.
*   **Roles:** Distinct User (Public) and Admin (Dashboard) interfaces.
*   **Complexity:** Medium-High. Includes authentication, file uploads, complex data relationships (bookings, packages, users). Note: the analytics module was removed from the codebase and is no longer considered part of the active architecture.
*   **Responsiveness:** Tailwind configuration suggests a mobile-first approach (`sm`, `md`, `lg` breakpoints used in Navbar).
