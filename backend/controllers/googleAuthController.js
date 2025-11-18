// Import Google authentication service functions
import * as googleService from '../services/googleAuthService.js';

/**
 * Initiate Google OAuth login flow
 * Redirects user to Google's authorization page
 */
export const googleLogin = (req, res) => {
  try {
    // Get Google OAuth authorization URL from service
    const authUrl = googleService.getGoogleAuthUrl();
    // Redirect user to Google's authentication page
    res.redirect(authUrl);
  } catch (error) {
    // Handle errors during login initiation
    res.status(500).json({ 
      success: false, 
      message: 'Error initiating Google login', 
      error: error.message 
    });
  }
};

/**
 * Handle Google OAuth callback after user authentication
 * Processes the authorization code and exchanges it for tokens
 */
export const googleCallback = async (req, res) => {
  try {
    // Extract authorization code from query parameters
    const { code } = req.query;
    
    // Exchange authorization code for access token and user data
    const { token, userData } = await googleService.handleGoogleCallback(code);

    // Get frontend URL from environment variables or use default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirect to frontend with token and user data as URL parameters
    res.redirect(`${frontendUrl}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  } catch (error) {
    // Log detailed error for debugging
    console.error('Google OAuth Error:', error);
    
    // Get frontend URL for error redirection
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirect to frontend login page with error details
    res.redirect(`${frontendUrl}/login?error=Google+login+failed&message=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Fetch Google user profile information
 * Requires authenticated user (req.user should be set by middleware)
 */
export const getGoogleProfile = async (req, res) => {
  try {
    // Get user profile data using user ID from authenticated request
    const data = await googleService.getGoogleUserProfile(req.user.id);
    
    // Return user profile data
    res.json({ success: true, data });
  } catch (error) {
    // Handle errors during profile fetching
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user profile', 
      error: error.message 
    });
  }
};

/**
 * Test Google OAuth configuration
 * Useful for debugging and verifying setup
 */
export const testGoogleConfig = (req, res) => {
  try {
    // Return Google OAuth configuration status
    res.json({ 
      success: true, 
      message: 'Google OAuth is configured', 
      config: googleService.testGoogleConfiguration() 
    });
  } catch (error) {
    // Handle configuration check errors
    res.status(500).json({ 
      success: false, 
      message: 'Error checking Google config', 
      error: error.message 
    });
  }
};