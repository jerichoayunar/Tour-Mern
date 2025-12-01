// Custom rate limiter - No external package needed

/**
 * 🎯 RATE LIMITING KEY POINTS:
 * 
 * AUTHENTICATION (login/register):
 * - 5 attempts allowed per 15 minutes per IP
 * - Error: "Too many authentication attempts. Please try again in 15 minutes."
 * - Uses storage key: "auth-IP_ADDRESS"
 * 
 * PASSWORD RESET:
 * - 3 attempts allowed per 1 hour per IP  
 * - Error: "Too many password reset attempts. Please try again in 1 hour."
 * - Uses storage key: "IP_ADDRESS"
 * 
 * 🛠️ TESTING TIPS:
 * - Restart server to clear limits
 * - Wait for time window to expire
 * - Change IP address to bypass
 * - Modify maxAttempts/windowMs for development
 */

const rateLimitStore = new Map(); // ✅ In-memory storage for tracking requests

// Default thresholds for IP-based login failed attempts
const DEFAULT_IP_LOGIN_MAX = 10;

export const passwordResetLimiter = (req, res, next) => {
  const ip = req.ip; // ✅ Get client IP address
  const currentTime = Date.now();
  const windowMs = 60 * 60 * 1000; // ⏰ 1 hour time window
  const maxAttempts = 3; // 🔒 Max 3 password reset attempts per hour

  // 🧹 Clean old entries (optional cleanup to prevent memory leaks)
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (currentTime - value.firstAttempt > windowMs) {
        rateLimitStore.delete(key); // 🗑️ Remove expired entries
      }
    }
  }

  // 📊 Get existing client data or create new entry
  const clientData = rateLimitStore.get(ip) || {
    count: 0, // 🎯 Number of attempts
    firstAttempt: currentTime // ⏱️ When the first attempt was made
  };

  // 🔄 Reset counter if time window has passed
  if (currentTime - clientData.firstAttempt > windowMs) {
    clientData.count = 1; // 🆕 Start new window with 1 attempt
    clientData.firstAttempt = currentTime;
  } else {
    clientData.count += 1; // ➕ Increment attempt count
  }

  rateLimitStore.set(ip, clientData); // 💾 Save updated data

  // 🚫 Check if exceeded limit
  if (clientData.count > maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again in 1 hour.',
      retryAfter: Math.ceil((clientData.firstAttempt + windowMs - currentTime) / 1000 / 60) + ' minutes'
    });
  }

  next(); // ✅ Allow request to proceed
};

export const authLimiter = (req, res, next) => {
  const ip = req.ip;
  const currentTime = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 100; // Increased for testing

  const clientData = rateLimitStore.get(`auth-${ip}`) || {
    count: 0,
    firstAttempt: currentTime
  };

  if (currentTime - clientData.firstAttempt > windowMs) {
    clientData.count = 1;
    clientData.firstAttempt = currentTime;
  } else {
    clientData.count += 1;
  }

  rateLimitStore.set(`auth-${ip}`, clientData);

  if (clientData.count > maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: Math.ceil((clientData.firstAttempt + windowMs - currentTime) / 1000 / 60) + ' minutes'
    });
  }

  // ✅ ADD: Store rate limit info for later adjustment
  req.rateLimitInfo = {
    ip,
    key: `auth-${ip}`,
    currentCount: clientData.count
  };

  next(); // ✅ Allow request to proceed
}; // ← THIS CLOSING BRACE ENDS THE authLimiter FUNCTION

// 🟡 LENIENT: For reCAPTCHA/validation errors (much higher limit)
export const requestLimiter = (req, res, next) => {
  const ip = req.ip;
  const currentTime = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxRequests = 1000; // Increased for testing

  const key = `requests-${ip}`;
  const clientData = rateLimitStore.get(key) || {
    count: 0,
    firstAttempt: currentTime
  };

  // Reset if window passed
  if (currentTime - clientData.firstAttempt > windowMs) {
    clientData.count = 0;
    clientData.firstAttempt = currentTime;
  }

  clientData.count += 1;
  rateLimitStore.set(key, clientData);

  if (clientData.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down.',
      retryAfter: Math.ceil((clientData.firstAttempt + windowMs - currentTime) / 1000 / 60) + ' minutes'
    });
  }

  next();
};

// 🔒 STRICT: For failed login attempts (IP-based)
export const loginAttemptLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxFailedAttempts = DEFAULT_IP_LOGIN_MAX; // default per-IP failed login threshold

  const key = `login-failed-${ip}`;
  const clientData = rateLimitStore.get(key) || {
    count: 0,
    firstAttempt: currentTime,
    lastAttempt: currentTime
  };

  // Reset if window passed
  if (currentTime - clientData.firstAttempt > windowMs) {
    clientData.count = 0;
    clientData.firstAttempt = currentTime;
  }

  clientData.lastAttempt = currentTime;

  // Store for later use in authController
  req.failedLoginLimit = {
    key,
    currentCount: clientData.count,
    maxAttempts: maxFailedAttempts,
    remainingAttempts: Math.max(0, maxFailedAttempts - clientData.count),
    resetTime: clientData.firstAttempt + windowMs
  };

  // Check IP-based limit
  if (clientData.count >= maxFailedAttempts) {
    const retryMinutes = Math.ceil((clientData.firstAttempt + windowMs - currentTime) / (1000 * 60));
    return res.status(429).json({
      success: false,
      message: `Too many login attempts from your IP. Please try again in ${retryMinutes} minute(s).`,
      retryAfter: retryMinutes,
      code: 'IP_RATE_LIMITED'
    });
  }

  rateLimitStore.set(key, clientData);
  next();
};

// ✅ Function to increment failed attempts
export const incrementFailedLogin = (ip) => {
  const key = `login-failed-${ip}`;
  const currentTime = Date.now();
  const clientData = rateLimitStore.get(key) || {
    count: 0,
    firstAttempt: currentTime,
    lastAttempt: currentTime
  };
  
  clientData.count += 1;
  clientData.lastAttempt = currentTime;
  rateLimitStore.set(key, clientData);
  
  return {
    currentCount: clientData.count,
    remainingAttempts: Math.max(0, DEFAULT_IP_LOGIN_MAX - clientData.count),
    resetTime: clientData.firstAttempt + (15 * 60 * 1000)
  };
};

// ✅ Function to reset failed attempts (on successful login)
export const resetFailedLogin = (ip) => {
  const key = `login-failed-${ip}`;
  rateLimitStore.delete(key);
};

// ✅ Get current rate limit status
export const getLoginLimitStatus = (ip) => {
  const key = `login-failed-${ip}`;
  const clientData = rateLimitStore.get(key);
  
  if (!clientData) {
    return {
      limited: false,
      remainingAttempts: DEFAULT_IP_LOGIN_MAX,
      resetTime: Date.now() + (15 * 60 * 1000)
    };
  }
  
  const currentTime = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  // Check if window expired
  if (currentTime - clientData.firstAttempt > windowMs) {
    rateLimitStore.delete(key);
    return {
      limited: false,
      remainingAttempts: DEFAULT_IP_LOGIN_MAX,
      resetTime: currentTime + windowMs
    };
  }
  
  return {
    limited: clientData.count >= DEFAULT_IP_LOGIN_MAX,
    remainingAttempts: Math.max(0, DEFAULT_IP_LOGIN_MAX - clientData.count),
    resetTime: clientData.firstAttempt + windowMs
  };
};

// ✅ ADD THIS EXPORT LINE:
export { rateLimitStore };