# PHASE 4: MONITORING & UX ENHANCEMENTS

## 🎯 OBJECTIVE
Implement robust performance monitoring, improve User Experience (UX) with small but high-impact features, and ensure the application is production-ready.

## 📋 TASK LIST

### 🔍 PART 1: VERIFICATION (Immediate)
- [ ] **Verify Frontend Animations**
  - Check Homepage `Hero` section for smooth Framer Motion animations.
- [ ] **Verify Backend API**
  - Perform Login/Register flow to ensure `app.js` refactor is stable.
- [ ] **Verify Analytics** (ARCHIVED)
-  - The project analytics module has been removed. Any verification steps for `/admin/analytics` are now N/A; dashboard charts remain functional and use `DashboardCharts`.

### 🛠️ PART 2: UX ENHANCEMENTS (From Todo List)
- [ ] **Task 4.1: Character Counter**
  - **Target:** `Inquiry` Form (Message field).
  - **Goal:** Show "150/500" characters while typing.
  - **Tech:** Simple React state.

- [ ] **Task 4.2: Scroll to Top Button**
  - **Target:** Global Layout.
  - **Goal:** Show a floating arrow button when user scrolls down > 300px.
  - **Tech:** `framer-motion` for smooth appearance + `window.scrollTo`.

- [ ] **Task 4.3: Booking Cancellation Modal**
  - **Target:** User Dashboard (My Bookings).
  - **Goal:** Prevent accidental cancellations.
  - **Tech:** Reusable `ConfirmationModal` component.

### 📊 PART 3: MONITORING & OPTIMIZATION (Original Phase 4)
- [ ] **Task 4.4: Performance Monitoring**
  - **Goal:** Track Core Web Vitals (LCP, CLS, FID).
  - **Implementation:** Add `web-vitals` reporting to console or analytics endpoint.

- [ ] **Task 4.5: Error Boundary**
  - **Goal:** Prevent white screen of death if a component crashes.
  - **Implementation:** Wrap main App in a React Error Boundary.

---

## 📝 EXECUTION STRATEGY

1.  **Run Verification** first to ensure stability.
2.  **Implement UX Tasks** (4.1 - 4.3) one by one.
3.  **Add Monitoring** (4.4 - 4.5) as the final polish.
