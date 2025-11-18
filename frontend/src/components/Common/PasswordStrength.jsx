import { useEffect, useState } from 'react';
import { calculatePasswordStrength, getStrengthColor, getStrengthText } from '../../utils/passwordStrength';
import './PasswordStrength.css';

/**
 * PASSWORD STRENGTH COMPONENT
 * 
 * WHAT THIS DOES:
 * - Shows real-time password strength as user types
 * - Visual progress bar with color coding
 * - Lists password requirements with checkmarks
 * - Provides helpful suggestions
 * 
 * USAGE:
 * <PasswordStrength password={password} />
 */

function PasswordStrength({ password = '' }) {
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    if (password) {
      const result = calculatePasswordStrength(password);
      setStrength(result.score);
      setRequirements(result.requirements);
    } else {
      setStrength(0);
      setRequirements([]);
    }
  }, [password]);

  const strengthColor = getStrengthColor(strength);
  const strengthText = getStrengthText(strength);
  const progressWidth = (strength / 5) * 100;

  if (!password) return null;

  return (
    <div className="password-strength">
      {/* Strength Meter */}
      <div className="strength-meter">
        <div className="strength-labels">
          <span className="strength-text">Strength: {strengthText}</span>
          <span className="strength-score">{strength}/5</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{
              width: `${progressWidth}%`,
              backgroundColor: strengthColor
            }}
          ></div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="requirements-list">
        {requirements.map((req, index) => (
          <div 
            key={index} 
            className={`requirement ${req.met ? 'met' : 'unmet'}`}
          >
            <span className="requirement-icon">
              {req.met ? '✅' : '❌'}
            </span>
            <span className="requirement-text">{req.message}</span>
          </div>
        ))}
      </div>

      {/* Strength Suggestions */}
      {strength < 4 && (
        <div className="strength-suggestions">
          <p className="suggestion-title">💡 Tips to improve:</p>
          <ul className="suggestion-list">
            {strength < 2 && <li>Use at least 8 characters</li>}
            {strength < 3 && <li>Add numbers (0-9)</li>}
            {strength < 4 && <li>Mix uppercase & lowercase letters</li>}
            {strength < 5 && <li>Include special characters (!@#$%^&*)</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PasswordStrength;