import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Ensure required env variables are available
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn('⚠️  GitHub OAuth client ID/secret not set. GitHub auth will not work until they are configured.');
}

passport.use(new GitHubStrategy(
  {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL,
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Extract useful fields from profile
      const githubId = profile.id;
      const username = profile.username || profile.displayName || '';
      const avatar = (profile.photos && profile.photos[0] && profile.photos[0].value) || '';
      const profileUrl = profile.profileUrl || '';

      // Try to get primary email
      let email = '';
      if (profile.emails && profile.emails.length) {
        // prefer verified email if available
        email = profile.emails.find(e => e && e.value) ? profile.emails[0].value : '';
      }

      // 1) Find existing user by githubId
      let user = await User.findOne({ githubId });

      // 2) If not found, try find by email (users who registered via local/other but same email)
      if (!user && email) {
        user = await User.findOne({ email });
      }

      // 3) Create or update user
      if (!user) {
        // Create minimal user record
        const name = profile.displayName || username || 'GitHub User';
        const newUser = new User({
          name,
          email: email || `${username}@users.noreply.github.com`,
          loginMethod: 'github',
          githubId,
          githubUsername: username,
          githubProfileUrl: profileUrl,
          avatar,
          // password not required for github users
        });

        user = await newUser.save();
      } else {
        // Update fields if missing/outdated
        const updates = {};
        if (!user.githubId) updates.githubId = githubId;
        if (!user.githubUsername) updates.githubUsername = username;
        if (!user.githubProfileUrl) updates.githubProfileUrl = profileUrl;
        if (!user.avatar && avatar) updates.avatar = avatar;
        if (user.loginMethod !== 'github') updates.loginMethod = 'github';
        if (Object.keys(updates).length) {
          await User.updateOne({ _id: user._id }, { $set: updates });
          user = await User.findById(user._id);
        }
      }

      return done(null, user);
    } catch (error) {
      console.error('GitHub Strategy Error:', error);
      return done(error, null);
    }
  }
));

export default passport;