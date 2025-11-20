# UI Consistency Fix Plan

## Phase 1: Foundation & Configuration
- [ ] **Fix Global Layout:** Remove restrictive styles in `src/App.css` that constrain the application width.
- [ ] **Standardize Colors (Proposed Minimal Palette):**
    - **Primary:** `Blue-600` (#2563EB) - Clean, professional, trustworthy.
    - **Neutrals:** `Slate` scale (Slate-50 for backgrounds, Slate-900 for text).
    - **Success:** `Emerald-600` (#059669).
    - **Warning:** `Amber-500` (#F59E0B) (Used sparingly for alerts only).
    - **Danger:** `Red-600` (#DC2626).
    - *Action:* Update `tailwind.config.js` to map `primary` to these values and remove the "Orange/Gradient" styles.
    - *Action:* Remove duplicate animation definitions in `src/index.css`.

## Phase 2: Core Component Standardization
- [ ] **Refactor `Button.jsx`:**
    - Remove hardcoded gradients.
    - Use `bg-primary-600` (or configured token).
    - Ensure `secondary`, `danger`, and `success` variants align with the design system.
- [ ] **Refactor `Input.jsx`:**
    - Match focus rings to the primary color.
    - Add `error` prop and styling.
- [ ] **Create Missing Components:**
    - `Card` (to replace repeated white rounded divs).
    - `Badge` (for status indicators in Admin).

## Phase 3: Admin Interface Refactor
- [ ] **Migrate `AdminLayout`:**
    - Remove `AdminLayout.css`.
    - Convert sidebar and header to Tailwind classes.
- [ ] **Update Dashboard:**
    - Replace raw `<button>` tags with the `Button` component.
    - Use `Card` component for stats and charts containers.

## Phase 4: User Interface Refactor
- [ ] **Normalize Profile Page:**
    - Remove `Profile.css`.
    - Rebuild Profile UI using standard Tailwind classes and the `Button` component.
    - Remove the "Earthy" theme unless it's a specific sub-brand requirement (unlikely).
- [ ] **Update Navbar:**
    - Use `primary` color tokens instead of hardcoded `blue-600`.

## Phase 5: Cleanup
- [ ] Delete `src/components/layout/admin/AdminLayout.css`.
- [ ] Delete `src/pages/user/Profile.css`.
- [ ] Audit and remove unused CSS classes in `src/index.css`.
