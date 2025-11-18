/**
 * PASSWORD STRENGTH UTILITIES
 * 
 * WHAT THIS DOES:
 * - Calculates password strength score (0-5)
 * - Checks various password requirements
 * - Provides strength feedback and suggestions
 * - Common password detection
 */

// Common weak passwords to check against
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', '123456789', '12345',
  'qwerty', 'abc123', 'password1', '1234567', 'admin',
  'welcome', 'monkey', 'letmein', 'login', 'passw0rd',
  'master', 'hello', 'freedom', 'whatever', 'qazwsx'
];

/**
 * Calculate password strength score and requirements
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      requirements: []
    };
  }

  let score = 0;
  const requirements = [];

  // Requirement 1: Minimum length
  const hasMinLength = password.length >= 8;
  requirements.push({
    message: 'At least 8 characters',
    met: hasMinLength
  });
  if (hasMinLength) score += 1;

  // Requirement 2: Contains numbers
  const hasNumbers = /[0-9]/.test(password);
  requirements.push({
    message: 'Contains numbers',
    met: hasNumbers
  });
  if (hasNumbers) score += 1;

  // Requirement 3: Contains lowercase letters
  const hasLowercase = /[a-z]/.test(password);
  requirements.push({
    message: 'Contains lowercase letters',
    met: hasLowercase
  });
  if (hasLowercase) score += 1;

  // Requirement 4: Contains uppercase letters
  const hasUppercase = /[A-Z]/.test(password);
  requirements.push({
    message: 'Contains uppercase letters',
    met: hasUppercase
  });
  if (hasUppercase) score += 1;

  // Requirement 5: Contains special characters
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  requirements.push({
    message: 'Contains special characters',
    met: hasSpecialChars
  });
  if (hasSpecialChars) score += 1;

  // Bonus points for length and complexity
  if (password.length >= 12) score = Math.min(score + 1, 5);
  if (password.length >= 16) score = Math.min(score + 1, 5);

  // Penalty for common passwords
  const isCommonPassword = COMMON_PASSWORDS.includes(password.toLowerCase());
  if (isCommonPassword) {
    score = Math.max(1, score - 2);
    requirements.push({
      message: 'Not a common password',
      met: false
    });
  } else {
    requirements.push({
      message: 'Not a common password',
      met: true
    });
  }

  // Ensure score is between 0 and 5
  score = Math.max(0, Math.min(5, score));

  return {
    score,
    requirements
  };
};

/**
 * Get color based on strength score
 */
export const getStrengthColor = (score) => {
  const colors = [
    '#ef4444', // Red - Very Weak
    '#f97316', // Orange - Weak
    '#eab308', // Yellow - Fair
    '#84cc16', // Lime - Good
    '#22c55e', // Green - Strong
    '#16a34a'  // Dark Green - Very Strong
  ];
  return colors[score] || colors[0];
};

/**
 * Get text description based on strength score
 */
export const getStrengthText = (score) => {
  const texts = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good', 
    'Strong',
    'Very Strong'
  ];
  return texts[score] || texts[0];
};

/**
 * Check if password meets minimum requirements
 */
export const meetsMinimumRequirements = (password) => {
  const strength = calculatePasswordStrength(password);
  return strength.score >= 3; // At least "Good" strength
};

/**
 * Generate password suggestions
 */
export const getPasswordSuggestions = (password) => {
  const suggestions = [];
  const strength = calculatePasswordStrength(password);

  if (strength.score < 3) {
    if (password.length < 8) {
      suggestions.push('Use at least 8 characters');
    }
    if (!/[0-9]/.test(password)) {
      suggestions.push('Add numbers (0-9)');
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      suggestions.push('Mix uppercase and lowercase letters');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      suggestions.push('Include special characters (!@#$%^&*)');
    }
  }

  return suggestions;
};