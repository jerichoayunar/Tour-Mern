// services/settingsService.js
import Settings from '../models/Settings.js';
import ApiError from '../utils/ApiError.js';
import { getTs } from '../utils/tsop.js';

/**
 * Get all settings (admin access)
 */
export const getSettings = async () => {
  const settings = await Settings.getSettings();
  // If TSOP is enabled, provide a client-visible transaction timestamp
  if (process.env.ENABLE_TSOP) {
    // attach a read timestamp that client can use when saving (opt-in)
    const obj = settings.toObject ? settings.toObject() : { ...settings };
    obj._txTs = getTs();
    return obj;
  }
  return settings;
};

/**
 * Update settings (admin only)
 */
export const updateSettings = async (updates, userId) => {
  try {
    // If client provided a tx timestamp (_txTs), pass it into the model as opts
    const txTs = updates && updates._txTs ? updates._txTs : undefined;
    // Remove client-side helper field before saving
    if (updates && updates._txTs) delete updates._txTs;

    const settings = await Settings.updateSettings(updates, userId, { enableTsop: Boolean(process.env.ENABLE_TSOP), txTs });
    return settings;
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new ApiError(400, `Validation error: ${error.message}`);
    }
    // Map TSOP aborts to HTTP 409 Conflict for clarity in UI
    if (error && error.code && error.code.startsWith && error.code.startsWith('TSOP_ABORT')) {
      throw new ApiError(409, `Conflict (TSOP): ${error.message}`);
    }
    throw new ApiError(500, `Failed to update settings: ${error.message}`);
  }
};

/**
 * Get public settings (safe data only, no sensitive info)
 */
export const getPublicSettings = async () => {
  const settings = await Settings.getSettings();
  
  // Return only safe, public-facing data
  return {
    general: {
      siteName: settings.general.siteName,
      tagline: settings.general.tagline,
      description: settings.general.description,
      logo: settings.general.logo,
      favicon: settings.general.favicon
    },
    contact: {
      supportEmail: settings.contact.supportEmail,
      bookingEmail: settings.contact.bookingEmail || settings.contact.supportEmail,
      phone: settings.contact.phone,
      whatsappNumber: settings.contact.whatsappNumber || settings.contact.phone,
      address: settings.contact.address,
      city: settings.contact.city,
      country: settings.contact.country
    },
    businessHours: {
      weekday: settings.businessHours.weekday,
      saturday: settings.businessHours.saturday,
      sunday: settings.businessHours.sunday,
      timezone: settings.businessHours.timezone,
      timezoneDisplay: settings.businessHours.timezoneDisplay
    },
    aboutUs: {
      heroTitle: settings.aboutUs?.heroTitle,
      heroSubtitle: settings.aboutUs?.heroSubtitle,
      whoWeAre: settings.aboutUs?.whoWeAre,
      mission: settings.aboutUs?.mission,
      vision: settings.aboutUs?.vision,
      values: settings.aboutUs?.values,
      stats: {
        happyTravelers: settings.aboutUs?.stats?.happyTravelers,
        tourPackages: settings.aboutUs?.stats?.tourPackages,
        destinations: settings.aboutUs?.stats?.destinations,
        yearsExperience: settings.aboutUs?.stats?.yearsExperience
      }
    },
    localization: {
      currency: settings.localization.currency,
      currencySymbol: settings.localization.currencySymbol,
      secondaryCurrency: settings.localization.secondaryCurrency,
      conversionRate: settings.localization.conversionRate,
      showSecondaryCurrency: settings.localization.showSecondaryCurrency,
      dateFormat: settings.localization.dateFormat,
      timeFormat: settings.localization.timeFormat,
      locale: settings.localization.locale
    },
    display: {
      itemsPerPageGrid: settings.display.itemsPerPageGrid,
      itemsPerPageTable: settings.display.itemsPerPageTable,
      defaultLanguage: settings.display.defaultLanguage
    },
    booking: {
      minAdvanceDays: settings.booking.minAdvanceDays,
      minGroupSize: settings.booking.minGroupSize,
      maxGroupSize: settings.booking.maxGroupSize,
      cancellationPolicy: {
        days14Plus: settings.booking.cancellationPolicy.days14Plus,
        days7to13: settings.booking.cancellationPolicy.days7to13,
        daysUnder7: settings.booking.cancellationPolicy.daysUnder7,
        customText: settings.booking.cancellationPolicy.customText
      },
      paymentMethods: settings.booking.paymentMethods
    }
  };
};
