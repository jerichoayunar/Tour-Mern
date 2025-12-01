import { useEffect, useState } from 'react';
import { calculatePasswordStrength, getStrengthColor, getStrengthText } from '../../utils/passwordStrength';
import './PasswordStrength.css'

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
    <div className="pw-minimal" aria-live="polite">
      <div className="pw-row">
        <div className="pw-label">{strengthText}</div>
        <div className="pw-score">{strength}/5</div>
      </div>

      <div className="pw-bar" aria-hidden="true">
        <div className="pw-fill" style={{ width: `${progressWidth}%`, background: strengthColor }} />
      </div>

      <div className="pw-reqs" aria-hidden="false">
        {requirements.map((req, i) => (
          <div key={i} className={`pw-req ${req.met ? 'met' : 'unmet'}`}>
            <span className="pw-req-icon">{req.met ? '✓' : '✕'}</span>
            <span className="pw-req-text">{req.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordStrength;