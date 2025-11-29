# UI Consistency Fix Plan

## Phase 1: Foundation & Configuration
- [x] **Fix Global Layout:** Remove restrictive styles in `src/App.css` that constrain the application width.
- [x] **Standardize Colors with Enhanced Palette:**
    - **Primary:** `Blue-600` (#2563EB) - Clean, professional, trustworthy.
    - **Neutrals:** Use the provided grey palette (Carbon Black → Bright Snow)
    - **Success:** `Emerald-600` (#059669)
    - **Warning:** `Amber-500` (#F59E0B) 
    - **Danger:** `Red-600` (#DC2626)
    - *Action:* Update `tailwind.config.js` with enhanced color mapping
    - *Action:* Remove duplicate animation definitions in `src/index.css`
- [x] **Enhanced Tailwind Configuration:**
    ```javascript
    // Update tailwind.config.js with:
    colors: {
      primary: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
      bright: { 
        snow: '#f8f9fa', 100: '#29323a', 200: '#536475', 300: '#8496a8', 
        400: '#bfc8d1', 500: '#f8f9fa', 600: '#fafbfc', 700: '#fbfcfc', 
        800: '#fdfdfd', 900: '#fefefe' 
      },
      platinum: { 
        DEFAULT: '#e9ecef', 100: '#282f37', 200: '#505f6e', 300: '#7c8ea0', 
        400: '#b3bec8', 500: '#e9ecef', 600: '#eef1f3', 700: '#f3f4f6', 
        800: '#f7f8f9', 900: '#fbfbfc' 
      },
      alabaster: { 
        DEFAULT: '#dee2e6', 100: '#272d34', 200: '#4e5b67', 300: '#788899', 
        400: '#abb6c0', 500: '#dee2e6', 600: '#e5e9ec', 700: '#eceef1', 
        800: '#f2f4f5', 900: '#f9f9fa' 
      },
      pale: { 
        slate: '#ced4da', 
        muted: '#adb5bd'
      },
      slate: { 
        grey: '#6c757d', DEFAULT: '#6c757d', 100: '#161819', 200: '#2c2f32', 
        300: '#41474b', 400: '#575e64', 500: '#6c757d', 600: '#899199', 
        700: '#a7adb2', 800: '#c4c8cc', 900: '#e2e4e5' 
      },
      iron: { 
        DEFAULT: '#495057', 100: '#0e1011', 200: '#1d2022', 300: '#2b2f34', 
        400: '#3a3f45', 500: '#495057', 600: '#68727d', 700: '#8c959f', 
        800: '#b2b9bf', 900: '#d9dcdf' 
      },
      gunmetal: { 
        DEFAULT: '#343a40', 100: '#0b0c0d', 200: '#15171a', 300: '#202327', 
        400: '#2a2f34', 500: '#343a40', 600: '#58626c', 700: '#7d8995', 
        800: '#a9b0b8', 900: '#d4d8dc' 
      },
      carbon: { 
        DEFAULT: '#212529', 100: '#070808', 200: '#0e0f11', 300: '#141719', 
        400: '#1b1f22', 500: '#212529', 600: '#49525b', 700: '#6f7d8b', 
        800: '#9fa8b2', 900: '#cfd4d8' 
      },
      success: '#059669',
      warning: '#f59e0b',
      danger: '#dc2626'
    }
    ```

## Phase 2: Core Component Standardization
- [x] **Refactor `Button.jsx`:**
    - Remove hardcoded gradients
    - Use semantic color tokens: `bg-primary-600`, `bg-success`, `bg-danger`
    - Add consistent sizing: `size="sm" | "md" | "lg"`
    - Ensure proper contrast with new neutral palette
- [x] **Refactor `Input.jsx`:**
    - Use `border-pale-slate` for default state
    - Focus state: `focus:border-primary-500 focus:ring-primary-500`
    - Error state: `border-danger focus:ring-danger`
    - Add `error` prop and styling
- [x] **Create Missing Components:**
    - `Card` (to replace repeated white rounded divs) using `bg-bright-snow` and `border-alabaster`
    - `Badge` (for status indicators in Admin) using semantic colors
    - `Alert` component for notifications

## Phase 3: Admin Interface Refactor
- [x] **Migrate `AdminLayout`:**
    - Remove `AdminLayout.css`
    - Convert sidebar and header to Tailwind classes
    - Sidebar: `bg-gunmetal text-bright-snow`
    - Header: `bg-bright-snow border-b border-alabaster`
    - Main content: `bg-platinum`
- [x] **Update Dashboard:**
    - Replace raw `<button>` tags with the `Button` component
    - Use `Card` component for stats and charts containers
    - Stats cards: `bg-bright-snow border-alabaster`

## Phase 4: User Interface Refactor
- [x] **Normalize Profile Page:**
    - Remove `Profile.css`
    - Rebuild Profile UI using standard Tailwind classes and the `Button` component
    - Remove the "Earthy" theme unless it's a specific sub-brand requirement (unlikely)
    - Use `Card` component for profile sections
- [x] **Update Navbar:**
    - Use `primary` color tokens instead of hardcoded `blue-600`
    - Background: `bg-bright-snow` or `bg-carbon`
    - Active states: `text-primary-600`

## Phase 5: Cleanup
- [x] Delete `src/components/layout/admin/AdminLayout.css`
- [x] Delete `src/pages/user/Profile.css`
- [x] Audit and remove unused CSS classes in `src/index.css`
- [x] **Add CSS variable fallbacks** for legacy components (Updated `AuthForms.css` to match new palette)

## Phase 6: Prevention & Maintenance
- [ ] **Create component documentation** with color usage examples
- [ ] **Add ESLint rules** to prevent inline color hex values
- [ ] **Create UI review checklist** for pull requests
- [ ] **Set up component storybook** with all variants

## Phase 6: Prevention & Maintenance
- [ ] **Create component documentation** with color usage examples
- [ ] **Add ESLint rules** to prevent inline color hex values
- [ ] **Create UI review checklist** for pull requests
- [ ] **Set up component storybook** with all variants