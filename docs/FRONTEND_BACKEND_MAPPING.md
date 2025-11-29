Frontend ↔ Backend Mapping (focused on Bookings)

Summary:
- This document lists booking-related backend endpoints and where the frontend calls them. It highlights gaps found and actions taken (frontend-only fixes applied).

Backend endpoints (from `backend/routes/bookingRoutes.js`):
- GET /api/bookings/mybookings            -> get current user's bookings
- POST /api/bookings                     -> create booking
- GET  /api/bookings/:id/refund-estimate -> get server refund estimate
- GET  /api/bookings/:id                 -> get booking details
- PUT  /api/bookings/:id/cancel          -> cancel booking
- DELETE /api/bookings/:id               -> delete booking

Admin-only (authorize('admin')):
- GET  /api/bookings                     -> get all bookings
- PUT  /api/bookings/:id/status          -> update booking status
- PUT  /api/bookings/:id/refund          -> process refund
- PUT  /api/bookings/:id/notes           -> save admin notes
- POST /api/bookings/:id/resend-confirmation -> resend booking confirmation email
- PUT  /api/bookings/:id/archive
- PUT  /api/bookings/:id/restore
- DELETE /api/bookings/:id/permanent

Frontend callers (files under `frontend/src`):
- `frontend/src/services/bookingService.js` (API layer)
  - getBookings -> GET `/bookings`
  - getMyBookings -> GET `/bookings/mybookings`
  - createBooking -> POST `/bookings`
  - getBooking -> GET `/bookings/:id`
  - cancelBooking -> PUT `/bookings/:id/cancel`
  - updateBookingStatus -> PUT `/bookings/:id/status`
  - archive/restore/deletePermanent -> corresponding admin endpoints
  - (NEWLY ADDED) getRefundEstimate -> GET `/bookings/:id/refund-estimate`
  - (NEWLY ADDED) saveAdminNotes -> PUT `/bookings/:id/notes`
  - (NEWLY ADDED) resendConfirmation -> POST `/bookings/:id/resend-confirmation`

- `frontend/src/pages/user/Bookings.jsx`
  - Calls `bookingService.getRefundEstimate(bookingId)` when opening cancel modal (falls back to client calc if server fails).
  - Uses `useBookings` hook which calls `getMyBookings` and `getBookings` depending on view.

- `frontend/src/hooks/useBookings.js`
  - Uses `bookingService` for create, cancel, update, delete flows and displays toasts.

- `frontend/src/pages/admin/ManageBookings.jsx`
  - Calls `getBookings`, `updateBookingStatus`, archive/restore, etc.
  - Opens `BookingDetailsModal` for per-booking admin actions.

- `frontend/src/components/admin/bookings/BookingDetailsModal.jsx`
  - Displays booking details and admin notes. After this scan I wired it to call `saveAdminNotes` and `resendConfirmation` and added toast feedback.

Gaps found and actions taken (frontend-only):
- Missing booking client helpers:
  - `getRefundEstimate`, `saveAdminNotes`, `resendConfirmation` were missing from `frontend/src/services/bookingService.js` while the UI called them.
  - Action: implemented these three functions and exported them.

- Admin modal notes/resend UI:
  - `BookingDetailsModal.jsx` previously logged notes but didn't persist them or resend confirmations.
  - Action: fixed admin notes initialization (useEffect) and added API calls + toasts, and added a "Resend Confirmation" button for confirmed bookings.

Files modified in frontend (bookings area):
- `frontend/src/services/bookingService.js` (added: getRefundEstimate, saveAdminNotes, resendConfirmation)
- `frontend/src/components/admin/bookings/BookingDetailsModal.jsx` (initialized notes, save/resend handlers + toasts)

Next recommended frontend actions (optional, I can do these next):
- Add local UI feedback to update the booking object after saving notes (e.g., call a parent refresh or dispatch to context).
- Add confirmation dialog around "Resend Confirmation" and show response details (message / messageId if returned).
- Run a quick smoke test locally (PowerShell/curl commands) to exercise these endpoints via the frontend:
  - Create booking -> POST `/api/bookings`
  - Open cancel modal -> GET `/api/bookings/:id/refund-estimate`
  - Save admin notes -> PUT `/api/bookings/:id/notes`
  - Resend confirmation -> POST `/api/bookings/:id/resend-confirmation`

Git / recovery notes:
- Your `git status` from the `frontend` folder showed some deletions and modifications (some parent files and many frontend files). If you ran `git checkout -- .` in `frontend`, uncommitted changes may have been discarded and cannot be restored by `git` unless they were previously committed or stashed.
- If you want, I can:
  - Re-create missing frontend helpers and UI wiring (done for bookings). 
  - Recreate other lost components if you point me to missing files or give a list.
  - Produce a focused `git diff`/restore plan comparing workspace files against `origin/feature/phase5-development` (requires running `git` commands locally). Provide permission and I can prepare PowerShell commands for you to run.

If you'd like, I'll continue and: 
- (A) Patch other areas flagged by your `git status` (e.g., `BookingForm.jsx`, `useBookings.js`, Navbar, etc.) to rewire any missing calls.
- (B) Produce a smoke-test script (PowerShell) you can run locally to validate booking/admin flows.

Tell me which next step you prefer and I'll proceed.


**Expanded Mapping & Verification**

- **Auth**: backend routes under `/api/auth` (register, login, me, logout).
  - Frontend callers: `frontend/src/services/authService.js`, `frontend/src/context/AuthContext.jsx`, login/register forms in `frontend/src/components/Auth/*`.

- **Packages**: `/api/packages` (list, details, create/update/delete for admin).
  - Frontend callers: `frontend/src/services/packageService.js`, `frontend/src/pages/user/Packages.jsx`, `frontend/src/components/user/packages/PackageModal.jsx`, `frontend/src/components/user/packages/PackageCard.jsx`.

- **Destinations**: `/api/destinations` (list, details, search).
  - Frontend callers: `frontend/src/services/destinationService.js`, `frontend/src/pages/user/Destinations.jsx`, `frontend/src/components/user/destinations/DestinationModal.jsx`.

- **Inquiries**: `/api/inquiries` (create public inquiry, admin manage inbox).
  - Frontend callers: `frontend/src/services/inquiryService.js`, `frontend/src/components/user/inquiry/InquiryForm.jsx`, admin pages `frontend/src/pages/admin/ManageInquiries.jsx`.

- **Users**: `/api/users` (profile update, user list for admin).
  - Frontend callers: `frontend/src/services/userService.js`, `frontend/src/hooks/useProfile.js`, `frontend/src/pages/user/Profile.jsx`.

- **Admin**: various `/api/admin/*` routes (dashboard, stats, settings).
  - Frontend callers: `frontend/src/services/adminService.js`, many `frontend/src/pages/admin/*` pages.


**Files flagged by your `git status` earlier (suggested repair targets)**
- `src/components/user/bookings/BookingForm.jsx` — important for create-booking UX.
- `src/hooks/useBookings.js` — central booking hook (ensure exports and API usage consistent).
- `src/App.jsx` — routing; ensure routes point to `/bookings` and admin pages.
- `src/components/layout/user/Navbar.jsx` — booking history link and auth UI.
- `src/components/admin/clients/ClientDetailsModal.jsx` — admin client bookings tab.
- `src/components/ui/ConfirmationModal.jsx`, `Button.jsx`, `Select.jsx` — shared UI components that other components rely on.

If any of these were lost by `git checkout -- .`, I can recreate or rewire them to match the backend API.


**Quick Smoke-Test Scripts (PowerShell)**
- Create booking (replace token):
```powershell
$body = @{ packageId = "<PACKAGE_ID>"; guests = 2; bookingDate = "2025-12-20" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/bookings" -Headers @{ Authorization = "Bearer <BearerToken>"; "Content-Type"="application/json" } -Body $body
```

- Get refund estimate:
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/bookings/<BOOKING_ID>/refund-estimate" -Headers @{ Authorization = "Bearer <BearerToken>" }
```

- Save admin notes:
```powershell
Invoke-RestMethod -Method Put -Uri "http://localhost:5000/api/bookings/<BOOKING_ID>/notes" -Headers @{ Authorization = "Bearer <AdminBearerToken>"; "Content-Type"="application/json" } -Body (@{ notes = "Checked by admin" } | ConvertTo-Json)
```

- Resend confirmation:
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/bookings/<BOOKING_ID>/resend-confirmation" -Headers @{ Authorization = "Bearer <AdminBearerToken>" }
```


**Next steps (pick one)**
- **(A)** I patch and restore the frontend files flagged by your `git status` (recreate helpers/components and make sure UI calls match backend). I will work file-by-file and commit changes.
- **(B)** I prepare and run (read-only) `git` diagnostics for you to run locally to show diffs vs remote and identify lost uncommitted content (I can generate the commands and explain results).
- **(C)** I produce a short automated smoke-test script (PowerShell) that you can run locally to validate booking and admin flows end-to-end.

Reply with A, B, or C (or a combination) and I'll proceed.
