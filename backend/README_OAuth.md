# GitHub OAuth Setup

This file documents the GitHub OAuth setup and how to test locally.

## Required Environment Variables

Add these to your `backend/.env` (do NOT commit secrets):

- `GITHUB_CLIENT_ID` — from GitHub OAuth App
- `GITHUB_CLIENT_SECRET` — from GitHub OAuth App
- `GITHUB_CALLBACK_URL` — e.g. `http://localhost:5000/api/auth/github/callback`
- `CLIENT_URL` — frontend URL, e.g. `http://localhost:5173`
- `JWT_SECRET` — secret used to sign JWT tokens

Your `.env` should include (example):

```env
GITHUB_CLIENT_ID=Ov23lijusVjT0cWyZh5D
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
CLIENT_URL=http://localhost:5173
JWT_SECRET=someStrongRandomValue
```

## What Was Implemented

- `backend/config/passportGithub.js` — Passport GitHub strategy that finds or creates a `User` in MongoDB using the GitHub profile.
- `backend/routes/authRoutes.js` — Routes for:
  - `GET /api/auth/github` — starts GitHub OAuth
  - `GET /api/auth/github/callback` — handles callback, issues JWT, and redirects to the frontend at `CLIENT_URL/auth/success?token=<jwt>&user=<encoded-user-json>`
- `backend/models/User.js` — extended to include `githubId`, `githubUsername`, `githubProfileUrl`, and added `github` to `loginMethod`.
- `backend/server.js` — initializes Passport and loads the GitHub strategy.
- `frontend/src/components/Auth/LoginForm.jsx` — added a "Continue with GitHub" button that redirects to the backend OAuth entry point.
- `frontend/src/pages/user/AuthSuccess.jsx` — already present and handles reading `token` and `user` query params; stores token and user in `localStorage` and auth context.

## Quick Local Test

1. Ensure your `.env` contains the required variables.
2. Restart the backend server:

```powershell
cd backend
npm run dev
```

3. Start the frontend (if not running):

```powershell
cd frontend
npm run dev
```

4. In your browser, visit the login page and click "Continue with GitHub" or go directly to:

```
http://localhost:5000/api/auth/github
```

5. After approving the GitHub app, you will be redirected to:

```
http://localhost:5173/auth/success?token=<jwt>&user=<encodedUser>
```

The frontend `AuthSuccess` page will decode the user, store token and user in `localStorage`, set auth context, and redirect to the appropriate page.

## Security Notes

- Never commit `GITHUB_CLIENT_SECRET` or `JWT_SECRET` to source control.
- If the client secret is exposed, regenerate it in GitHub and update `.env` immediately.
- The JWT token contains `userId` and `email` and expires in 7 days.

## Next Steps / Optional

- Protect any routes that require authentication on the frontend by checking `localStorage.token` or using the `AuthContext`.
- Optionally: implement token refresh if desired.
- Optionally: log OAuth events for auditing.
