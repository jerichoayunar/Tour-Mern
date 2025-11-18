// Import required dependencies
import googleClient from '../config/googleOAuth.js'; // Google OAuth client configuration
import User from '../models/User.js'; // User model for database operations
import jwt from 'jsonwebtoken'; // JSON Web Token for authentication

/**
 * 🔑 Generate JWT Token
 * Creates a signed JWT token for user authentication
 * @param {string} id - User ID to encode in the token
 * @returns {string} JWT token with user ID payload
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '30d', // Token expiration (default 30 days)
  });
};

/**
 * 🔐 Generate Google OAuth URL
 * Creates the authorization URL that users are redirected to for Google login
 * @returns {string} Google OAuth authorization URL
 */
export const getGoogleAuthUrl = () => {
  return googleClient.generateAuthUrl({
    access_type: 'offline', // Request refresh token for long-lived access
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile', // Access to basic profile info
      'https://www.googleapis.com/auth/userinfo.email' // Access to email address
    ],
    prompt: 'consent' // Always prompt user for consent to ensure we get refresh token
  });
};

/**
 * 🔐 Handle Google OAuth Callback
 * Processes the authorization code returned by Google after user consent
 * @param {string} code - Authorization code from Google callback
 * @returns {Object} Contains JWT token and user data
 * @throws {Error} If authorization code is missing or processing fails
 */
export const handleGoogleCallback = async (code) => {
  // Validate that authorization code is provided
  if (!code) throw new Error('Authorization code not provided');

  // Exchange authorization code for access and ID tokens
  const { tokens } = await googleClient.getToken(code);
  googleClient.setCredentials(tokens); // Set tokens for future API calls

  // Verify the ID token and extract user payload
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID // Verify token was issued for our app
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload; // Extract user data from payload

  // Find existing user by email or Google ID
  let user = await User.findOne({ 
    $or: [{ email }, { googleId }] // Check both email and Google ID
  });

  // Handle existing user (linking Google account or updating info)
  if (user) {
    // If user exists but doesn't have Google ID, link their account
    if (!user.googleId) {
      user.googleId = googleId;
      user.loginMethod = 'google'; // Set login method to Google
      user.avatar = picture || user.avatar; // Update avatar if Google provides one
    }
    // Ensure user has a role assigned
    if (!user.role) user.role = 'user';
    await user.save();
  } else {
    // Create new user with Google account data
    user = await User.create({
      name,
      email,
      googleId,
      loginMethod: 'google', // Set login method
      role: 'user', // Default role
      avatar: picture || '', // Use Google profile picture if available
    });
  }

  // Generate JWT token for the user
  const token = generateToken(user._id);

  // Prepare user data to return (excluding sensitive information)
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    loginMethod: user.loginMethod
  };

  return { token, userData };
};

/**
 * 🔐 Get Google User Profile
 * Fetches user profile data from database
 * @param {string} userId - User ID to fetch profile for
 * @returns {Object} User profile data
 * @throws {Error} If user is not found
 */
export const getGoogleUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Return user profile (excluding sensitive data)
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    loginMethod: user.loginMethod
  };
};

/**
 * 🆕 Test Google Config
 * Verifies that all required Google OAuth environment variables are set
 * @returns {Object} Configuration status for each required environment variable
 */
export const testGoogleConfiguration = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL ? '✅ Set' : '❌ Missing'
});