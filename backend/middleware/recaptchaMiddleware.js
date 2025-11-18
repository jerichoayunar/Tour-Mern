import axios from 'axios';

export const recaptchaMiddleware = async (req, res, next) => {
  // Skip reCAPTCHA in development for easier testing
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔓 reCAPTCHA skipped in development');
    return next();
  }

  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA verification required. Please complete the security check.'
    });
  }

  try {
    console.log('🔍 Verifying reCAPTCHA token...');
    
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken
        }
      }
    );

    console.log('📊 reCAPTCHA response:', response.data);

    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
        error: response.data['error-codes']
      });
    }

    console.log('✅ reCAPTCHA verification passed');
    next();
  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'reCAPTCHA service unavailable. Please try again later.'
    });
  }
};