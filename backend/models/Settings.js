/**
 * =====================================================
 * 🔧 SETTINGS MODEL - SITE-WIDE CONFIGURATION
 * =====================================================
 * 
 * PURPOSE:
 * This model stores all configurable settings for the tour booking system.
 * It uses a SINGLETON pattern (only one document exists) to ensure consistency.
 * 
 * USAGE FLOW:
 * 1. Admin edits settings in Admin Panel → Settings page
 * 2. Settings saved to MongoDB (this model)
 * 3. User site fetches settings via public API
 * 4. Settings display across entire website (header, footer, prices, etc.)
 * 
 * SECTIONS:
 * - general: Site branding and identity
 * - contact: Contact information displayed to users
 * - businessHours: Operating hours shown on website
 * - localization: Currency, date format, language preferences
 * - display: Pagination and UI preferences
 * - booking: Booking rules and policies (Phase 2)
 * - notifications: Email notification toggles (Phase 3)
 * - security: Password and session rules (Phase 4)
 * - integrations: Third-party service configs (Phase 5)
 */

// models/Settings.js
import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  
  // ========================================
  // 🎨 GENERAL SETTINGS - Site Branding
  // ========================================
  // Purpose: Define your site's identity and appearance
  // Used in: Header, Browser Tab, SEO Meta Tags, Footer
  general: {
    siteName: {
      type: String,
      required: true,
      default: 'TourBook Travel',
      trim: true,
      maxlength: 100
      // WHERE USED: Website header logo text, browser title, email footers
      // EXAMPLE: "Welcome to {siteName}" → "Welcome to TourBook Travel"
    },
    tagline: {
      type: String,
      default: 'Your Gateway to Philippine Adventures',
      trim: true,
      maxlength: 200
      // WHERE USED: Below site name in header, homepage hero section
      // EXAMPLE: Hero subtitle, SEO meta description
    },
    description: {
      type: String,
      default: 'We offer premium tours and travel packages across the beautiful Philippines.',
      trim: true,
      maxlength: 1000
      // WHERE USED: About section, SEO meta description, footer
      // EXAMPLE: Search engine results preview text
    },
    logo: {
      type: String,
      default: ''
      // WHERE USED: Header logo image, email templates, invoices
      // EXAMPLE: Cloudinary URL of uploaded logo
    },
    favicon: {
      type: String,
      default: ''
      // WHERE USED: Browser tab icon (16x16 or 32x32 image)
      // EXAMPLE: Small icon next to page title in browser tab
    }
  },

  // ========================================
  // 📧 CONTACT SETTINGS - How Users Reach You
  // ========================================
  // Purpose: Contact information displayed across the site
  // Used in: Header, Footer, Contact Page, Inquiry Forms
  contact: {
    supportEmail: {
      type: String,
      required: true,
      default: 'support@tourbook.com',
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
      // WHERE USED: Contact page, inquiry auto-replies, customer support
      // EXAMPLE: "Need help? Email us at {supportEmail}"
    },
    bookingEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\S+@\S+\.\S+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
      // WHERE USED: Booking confirmations sent to this email (optional, falls back to supportEmail)
      // EXAMPLE: Separate inbox for booking notifications
    },
    phone: {
      type: String,
      required: true,
      default: '+63 917 123 4567',
      trim: true
      // WHERE USED: Header, footer, contact page, booking confirmations
      // EXAMPLE: "Call us at {phone}" displayed in header
    },
    whatsappNumber: {
      type: String,
      default: '',
      trim: true
      // WHERE USED: WhatsApp click-to-chat button on website
      // EXAMPLE: Floating WhatsApp button → opens chat with this number
    },
    address: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300
      // WHERE USED: Footer, contact page, Google Maps embed
      // EXAMPLE: "Visit us at: {address}, {city}, {country}"
    },
    city: {
      type: String,
      default: 'Manila',
      trim: true
      // WHERE USED: Combined with address for full location display
      // EXAMPLE: Footer location, invoices, business documents
    },
    country: {
      type: String,
      default: 'Philippines',
      trim: true
      // WHERE USED: Footer, contact page, international shipping/billing
      // EXAMPLE: "Based in {city}, {country}"
    }
  },

  // ========================================
  // 📖 ABOUT US CONTENT - About Page Settings
  // ========================================
  // Purpose: Customizable content for the About Us page
  // Used in: About Us Page
  aboutUs: {
    heroTitle: {
      type: String,
      default: 'Discover Bukidnon Tours',
      trim: true,
      maxlength: 100
    },
    heroSubtitle: {
      type: String,
      default: 'Where Adventure Meets Authentic Filipino Hospitality in the Heart of Bukidnon',
      trim: true,
      maxlength: 200
    },
    whoWeAre: {
      type: String,
      default: 'We are passionate about showcasing the natural beauty and rich culture of Bukidnon. Our team consists of experienced local guides and travel enthusiasts dedicated to creating unforgettable experiences.',
      trim: true,
      maxlength: 2000
    },
    mission: {
      type: String,
      default: 'To provide exceptional travel experiences that connect people with the natural beauty and cultural richness of Bukidnon, while promoting sustainable tourism practices that benefit local communities and preserve our environment for future generations.',
      trim: true,
      maxlength: 1000
    },
    vision: {
      type: String,
      default: 'To become the leading tour provider in Bukidnon, recognized for our commitment to quality, authenticity, and sustainability. We envision a future where tourism thrives in harmony with nature and culture, creating positive impacts for all.',
      trim: true,
      maxlength: 1000
    },
    stats: {
      happyTravelers: {
        type: String,
        default: '2,500+'
      },
      tourPackages: {
        type: String,
        default: '150+'
      },
      destinations: {
        type: String,
        default: '50+'
      },
      yearsExperience: {
        type: String,
        default: '10+'
      }
    }
  ,
    // Core values for the About page (editable via Admin Settings)
    values: [
      {
        title: { type: String, default: 'Passion for Travel', trim: true },
        description: { type: String, default: 'We are travelers at heart — passionate about sharing Bukidnon’s natural beauty and culture with curious explorers.', trim: true },
        icon: { type: String, default: 'Heart' }
      },
      {
        title: { type: String, default: 'Safety First', trim: true },
        description: { type: String, default: 'Your safety is our priority. We partner with certified guides and follow best practices so you can travel with confidence.', trim: true },
        icon: { type: String, default: 'ShieldCheck' }
      },
      {
        title: { type: String, default: 'Sustainable Tourism', trim: true },
        description: { type: String, default: 'We practice responsible tourism that respects local cultures and protects the natural environment for future generations.', trim: true },
        icon: { type: String, default: 'Globe' }
      },
      {
        title: { type: String, default: 'Community Focused', trim: true },
        description: { type: String, default: 'We create local impact by hiring community guides and partnering with small businesses and artisans.', trim: true },
        icon: { type: String, default: 'Users' }
      }
    ]
  },

  // ========================================
  // 🕐 BUSINESS HOURS - Operating Schedule
  // ========================================
  // Purpose: Show customers when you're available
  // Used in: Footer, Contact Page, Booking Page
  businessHours: {
    weekday: {
      type: String,
      default: '9:00 AM - 6:00 PM',
      trim: true
      // WHERE USED: Footer, contact page under "Operating Hours"
      // EXAMPLE: "Monday - Friday: {weekday}"
    },
    saturday: {
      type: String,
      default: '9:00 AM - 5:00 PM',
      trim: true
      // WHERE USED: Same as weekday
      // EXAMPLE: "Saturday: {saturday}"
    },
    sunday: {
      type: String,
      default: 'By Appointment',
      trim: true
      // WHERE USED: Same as weekday
      // EXAMPLE: "Sunday: {sunday}" or "Sunday: Closed"
    },
    timezone: {
      type: String,
      default: 'Asia/Manila',
      trim: true
      // WHERE USED: Backend for scheduling, date/time conversions
      // EXAMPLE: Ensures booking times are in correct timezone
    },
    timezoneDisplay: {
      type: String,
      default: 'PHT (UTC+8)',
      trim: true
      // WHERE USED: Displayed next to business hours for clarity
      // EXAMPLE: "Hours: 9AM - 6PM {timezoneDisplay}"
    }
  },

  // ========================================
  // 🌍 LOCALIZATION - Currency & Formatting
  // ========================================
  // Purpose: Adapt the site for different regions and currencies
  // Used in: All price displays, date formatting, number formatting
  localization: {
    currency: {
      type: String,
      default: 'PHP',
      uppercase: true,
      trim: true,
      maxlength: 3
      // WHERE USED: Primary currency for all prices on the site
      // EXAMPLE: Package price: "{currencySymbol}5,000" displays as "₱5,000"
      // NOTE: This affects how prices are stored and displayed
    },
    currencySymbol: {
      type: String,
      default: '₱',
      trim: true
      // WHERE USED: Prepended to all price displays
      // EXAMPLE: "{currencySymbol}{price}" → "₱5,000" or "$100"
      // Auto-updates when currency changes (PHP→₱, USD→$, EUR→€)
    },
    secondaryCurrency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      maxlength: 3
      // WHERE USED: Optional second currency shown in parentheses
      // EXAMPLE: "₱5,000 ($90 USD)" for international customers
    },
    conversionRate: {
      type: Number,
      default: 55.5,
      min: 0
      // WHERE USED: Converts primary currency to secondary
      // EXAMPLE: ₱5,000 ÷ 55.5 = $90.09 USD
      // NOTE: Update this when exchange rates change
    },
    showSecondaryCurrency: {
      type: Boolean,
      default: true
      // WHERE USED: Toggle to show/hide secondary currency
      // EXAMPLE: true → "₱5,000 ($90)", false → "₱5,000"
    },
    dateFormat: {
      type: String,
      default: 'MMM DD, YYYY',
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMM DD, YYYY', 'DD MMM YYYY'],
      trim: true
      // WHERE USED: All date displays across the site
      // EXAMPLES:
      // - 'MM/DD/YYYY' → "11/18/2025" (USA)
      // - 'DD/MM/YYYY' → "18/11/2025" (Europe/Philippines)
      // - 'MMM DD, YYYY' → "Nov 18, 2025" (Most readable)
      // - 'DD MMM YYYY' → "18 Nov 2025" (UK style)
      // - 'YYYY-MM-DD' → "2025-11-18" (ISO format)
    },
    timeFormat: {
      type: String,
      default: '12h',
      enum: ['12h', '24h']
      // WHERE USED: All time displays
      // EXAMPLES:
      // - '12h' → "2:30 PM" (USA/Philippines)
      // - '24h' → "14:30" (Europe/Military)
    },
    locale: {
      type: String,
      default: 'en-PH',
      trim: true
      // WHERE USED: Number formatting, currency placement
      // EXAMPLES:
      // - 'en-PH' → "₱5,000.00" (comma thousands, period decimal)
      // - 'en-US' → "$5,000.00"
      // - 'de-DE' → "5.000,00 €" (period thousands, comma decimal)
    }
  },

  // ========================================
  // 📊 DISPLAY SETTINGS - UI Preferences
  // ========================================
  // Purpose: Control how content is paginated and displayed
  // Used in: Package listings, booking tables, destination grids
  display: {
    itemsPerPageGrid: {
      type: Number,
      default: 12,
      min: 6,
      max: 24
      // WHERE USED: Package cards, destination cards on user site
      // EXAMPLE: Home page shows 12 packages per page, then pagination
      // WHY: Grid layouts work best with multiples of 3 or 4 (3x4=12)
    },
    itemsPerPageTable: {
      type: Number,
      default: 10,
      min: 5,
      max: 50
      // WHERE USED: Admin tables (bookings, users, inquiries)
      // EXAMPLE: Bookings table shows 10 rows, then pagination
      // WHY: Tables are easier to scan with 10-20 rows
    },
    defaultLanguage: {
      type: String,
      default: 'en',
      trim: true
      // WHERE USED: Site language (for future multi-language support)
      // EXAMPLE: 'en' → English, 'fil' → Filipino, 'es' → Spanish
    }
  },

  // ========================================
  // 📅 BOOKING CONFIGURATION (Phase 2)
  // ========================================
  // Purpose: Rules and policies for booking management
  // Used in: Booking form validation, policy displays, pricing
  booking: {
    minAdvanceDays: {
      type: Number,
      default: 2,
      min: 0
      // WHERE USED: Booking form date picker
      // EXAMPLE: Can't book tours starting in less than 2 days
      // WHY: Gives time for preparation and confirmation
    },
    minGroupSize: {
      type: Number,
      default: 1,
      min: 1
      // WHERE USED: Booking form - minimum number of people allowed per booking
      // EXAMPLE: "Minimum 1 person per booking"
    },
    maxGroupSize: {
      type: Number,
      default: 20,
      min: 1
      // WHERE USED: Booking form - number of people limit
      // EXAMPLE: "Maximum 20 people per booking"
      // WHY: Prevents overbooking tour capacity
    },
    autoConfirm: {
      type: Boolean,
      default: false
      // WHERE USED: Booking workflow
      // EXAMPLE: true → Booking auto-confirmed, false → Requires admin approval
    },
    requireDeposit: {
      type: Boolean,
      default: false
      // WHERE USED: Payment flow
      // EXAMPLE: true → Requires partial payment upfront
    },
    depositType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
      // WHERE USED: Deposit calculation
      // EXAMPLE: 'percentage' → 30% of total, 'fixed' → ₱1,000 flat
    },
    depositAmount: {
      type: Number,
      default: 30,
      min: 0
      // WHERE USED: Combined with depositType
      // EXAMPLE: depositType='percentage', depositAmount=30 → Pay 30% upfront
    },
    cancellationPolicy: {
      days14Plus: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
        // WHERE USED: Refund calculation, policy page
        // EXAMPLE: Cancel 14+ days before → 100% refund
      },
      days7to13: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
        // WHERE USED: Same as above
        // EXAMPLE: Cancel 7-13 days before → 50% refund
      },
      daysUnder7: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
        // WHERE USED: Same as above
        // EXAMPLE: Cancel less than 7 days before → 0% refund (no refund)
      },
      customText: {
        type: String,
        default: '',
        trim: true,
        maxlength: 500
        // WHERE USED: Policy page, booking confirmation email
        // EXAMPLE: "Cancellations due to weather are fully refunded"
      }
    },
    paymentMethods: {
      manualPayment: {
        type: Boolean,
        default: true
        // WHERE USED: Checkout page payment options
        // EXAMPLE: Show "Bank Transfer / Manual Payment" option
      },
      paypal: {
        type: Boolean,
        default: false
        // WHERE USED: Show PayPal button at checkout
        // EXAMPLE: Integrates with PayPal API (Phase 5)
      },
      creditCard: {
        type: Boolean,
        default: false
        // WHERE USED: Show credit card form at checkout
        // EXAMPLE: Stripe/PayMongo integration (Phase 5)
      },
      cashOnPickup: {
        type: Boolean,
        default: true
        // WHERE USED: Show "Pay when you arrive" option
        // EXAMPLE: Good for local customers or office pickups
      }
    }
  },

  // ========================================
  // 📧 NOTIFICATIONS (Phase 3 - Future)
  // ========================================
  // Purpose: Control which emails are sent automatically
  // Used in: Email service triggers, notification preferences
  notifications: {
    email: {
      bookingConfirmation: {
        type: Boolean,
        default: true
        // WHEN SENT: After customer makes a booking
        // TO: Customer's email
        // CONTENT: Booking details, payment instructions, contact info
      },
      bookingNotificationAdmin: {
        type: Boolean,
        default: true
        // WHEN SENT: Same as above
        // TO: Admin's supportEmail
        // CONTENT: New booking alert with customer details
      },
      paymentConfirmation: {
        type: Boolean,
        default: true
        // WHEN SENT: After payment is received/verified
        // TO: Customer
        // CONTENT: Receipt, payment details, booking status updated
      },
      cancellationEmail: {
        type: Boolean,
        default: true
        // WHEN SENT: When booking is cancelled
        // TO: Customer
        // CONTENT: Cancellation confirmation, refund details
      },
      inquiryResponse: {
        type: Boolean,
        default: true
        // WHEN SENT: When customer submits inquiry form
        // TO: Customer
        // CONTENT: "We received your inquiry, will respond soon"
      },
      welcomeEmail: {
        type: Boolean,
        default: false
        // WHEN SENT: After user registers account
        // TO: New user
        // CONTENT: Welcome message, site tour, special offers
      },
      passwordReset: {
        type: Boolean,
        default: true
        // WHEN SENT: User clicks "Forgot Password"
        // TO: User's email
        // CONTENT: Password reset link (expires in 1 hour)
      },
      bookingReminder: {
        type: Boolean,
        default: false
        // WHEN SENT: X days before tour date (see reminderDaysBefore)
        // TO: Customer
        // CONTENT: "Your tour is coming up! Prepare these items..."
      },
      reviewRequest: {
        type: Boolean,
        default: false
        // WHEN SENT: X days after tour date (see reviewRequestDaysAfter)
        // TO: Customer
        // CONTENT: "How was your tour? Please leave a review"
      }
    },
    reminderDaysBefore: {
      type: Number,
      default: 2,
      min: 0
      // WHERE USED: When bookingReminder is enabled
      // EXAMPLE: 2 → Send reminder 2 days before tour starts
    },
    reviewRequestDaysAfter: {
      type: Number,
      default: 3,
      min: 0
      // WHERE USED: When reviewRequest is enabled
      // EXAMPLE: 3 → Send review request 3 days after tour completes
    }
  },

  // ========================================
  // 🔒 SECURITY & PASSWORD (Phase 4 - Future)
  // ========================================
  // Purpose: Password policies and session management
  // security: {
  //   minPasswordLength: { type: Number, default: 8 }
  //   requireUppercase: { type: Boolean, default: true }
  //   requireNumbers: { type: Boolean, default: true }
  //   requireSpecialChars: { type: Boolean, default: false }
  //   sessionTimeout: { type: Number, default: 24 } // hours
  //   maxLoginAttempts: { type: Number, default: 5 }
  //   lockoutDuration: { type: Number, default: 15 } // minutes
  // },

  // ========================================
  // 🔌 INTEGRATIONS (Phase 5 - Future)
  // ========================================
  // Purpose: Third-party service credentials and configs
  // integrations: {
  //   paypal: { clientId: String, secret: String, mode: 'sandbox'|'live' }
  //   googleMaps: { apiKey: String }
  //   socialMedia: { facebook: String, instagram: String, twitter: String }
  //   analytics: { googleAnalyticsId: String }
  //   recaptcha: { siteKey: String, secretKey: String }
  // },

  // ========================================
  // 🔍 AUDIT FIELDS - Track Changes
  // ========================================
  // Purpose: Know who changed settings and when
  read_ts: { type: Number, default: 0 },
  write_ts: { type: Number, default: 0 },

  version: {
    type: Number,
    default: 1
    // WHERE USED: Optimistic locking, change tracking
    // EXAMPLE: Increments each time settings are updated (1→2→3...)
    // WHY: Prevents conflicting updates if two admins edit simultaneously
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // WHERE USED: Audit log, settings history
    // EXAMPLE: Shows which admin made the last change
  }
}, {
  timestamps: true
  // AUTO-CREATES: createdAt, updatedAt fields
  // WHERE USED: Track when settings were first created and last modified
  // EXAMPLE: "Settings last updated: Nov 18, 2025 11:43 PM"
});

// ========================================
// 🔧 STATIC METHODS - Custom Functions
// ========================================

/**
 * GET SETTINGS (Singleton)
 * ========================
 * PURPOSE: Retrieve the one-and-only settings document
 * BEHAVIOR: If no settings exist, creates one with defaults
 * 
 * USAGE:
 * const settings = await Settings.getSettings();
 * console.log(settings.general.siteName); // "TourBook Travel"
 */
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    // No settings found → Create default settings
    settings = await this.create({});
  }
  return settings;
};

/**
 * UPDATE SETTINGS (Singleton)
 * ===========================
 * PURPOSE: Update settings with new values
 * SECURITY: Filters out system fields to prevent conflicts
 * VALIDATION: Runs all schema validators before saving
 * 
 * PARAMETERS:
 * - updates: Object containing new settings values
 * - userId: ID of admin who made the change
 * 
 * USAGE:
 * const updated = await Settings.updateSettings({
 *   general: { siteName: 'My Tour Company' },
 *   contact: { phone: '+63 912 345 6789' }
 * }, adminUserId);
 */
import { getTs, readWithTS, writeWithTS } from '../utils/tsop.js';

SettingsSchema.statics.updateSettings = async function(updates, userId, opts = {}) {
  // Remove system fields to prevent conflicts
  const { _id, __v, version, createdAt, updatedAt, lastUpdatedBy, ...cleanUpdates } = updates;
  const enableTsop = Boolean(process.env.ENABLE_TSOP) || Boolean(opts.enableTsop);

  if (!enableTsop) {
    const settings = await this.findOneAndUpdate(
      {},
      {
        ...cleanUpdates,
        lastUpdatedBy: userId,
        $inc: { version: 1 }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    ).populate('lastUpdatedBy', 'name email');
    return settings;
  }

  // Prefer client-provided txTs (opts.txTs) so the UI can start a transaction at read time
  const txTs = opts && opts.txTs ? opts.txTs : getTs();
  const Model = this;
  // Read with TS check (throws on read conflict)
  const base = await readWithTS(Model, {}, txTs);
  
  if (!base) {
    const created = await this.create({ ...cleanUpdates, lastUpdatedBy: userId, write_ts: txTs });
    return created;
  }

  // Attempt write using TSOP rules
  try {
    const res = await writeWithTS(
      Model,
      { _id: base._id },
      { $set: { ...cleanUpdates, lastUpdatedBy: userId }, $inc: { version: 1 } },
      txTs,
      { new: true, runValidators: true }
    );
    // populate lastUpdatedBy for parity with non-TSOP flow
    await res.populate('lastUpdatedBy', 'name email').execPopulate?.();
    return res;
  } catch (err) {
    if (err && err.code && err.code.startsWith('TSOP_ABORT')) {
      const e = new Error('TSOP abort: ' + err.message);
      e.code = err.code;
      throw e;
    }
    throw err;
  }
};

const Settings = mongoose.model('Settings', SettingsSchema);

export default Settings;
