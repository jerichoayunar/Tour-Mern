import React from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../../../context/SettingsContext";

// Simple SVG Icons to replace lucide-react imports
const MapPinIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PhoneIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const FacebookIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TiktokIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 1.53.63 3.09 1.75 4.17c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97c-.57-.26-1.1-.59-1.62-.93c-.01 2.92.01 5.84-.02 8.75c-.08 1.4-.54 2.79-1.35 3.94c-1.31 1.92-3.58 3.17-5.91 3.21c-1.43.08-2.86-.31-4.08-1.03c-2.02-1.19-3.44-3.37-3.65-5.71c-.02-.5-.03-1-.01-1.49c.18-1.9 1.12-3.72 2.58-4.96c1.66-1.44 3.98-2.13 6.15-1.72c.02 1.48-.04 2.96-.04 4.44c-.99-.32-2.15-.23-3.02.37c-.63.41-1.11 1.04-1.36 1.75c-.21.51-.15 1.07-.14 1.61c.24 1.64 1.82 3.02 3.5 2.87c1.12-.01 2.19-.66 2.77-1.61c.19-.33.4-.67.41-1.06c.1-1.79.06-3.57.07-5.36c.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-slate-900/8 to-slate-950/30 pointer-events-none"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              {settings?.general?.siteName || "Bukidnon Tours"}
              <span className="block text-primary-400 text-sm font-normal mt-1">
                {settings?.general?.tagline || "Adventure Awaits"}
              </span>
            </h3>
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-4 mb-6 group cursor-pointer">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-md flex items-center justify-center transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <img
                    src={settings?.general?.logo || "/images/destinations/bukidnonupdates.jpg"}
                    alt={settings?.general?.siteName || "ExploreBukidnon"}
                    className="w-12 h-12 object-cover rounded-xl"
                  />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-blue-400/20 blur-md group-hover:blur-lg transition-all duration-300 -z-10"></div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-transform duration-300">
                  {settings?.general?.siteName || "ExploreBukidnon"}
                </h3>
                <p className="text-slate-400 font-medium mt-1 tracking-wide">
                  Travel & Adventures
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-400 mb-6 leading-relaxed max-w-md border-l-4 border-blue-500 pl-4">
              {settings?.general?.description || "Your trusted partner for exploring breathtaking landscapes and rich cultural experiences across Bukidnon's scenic highlands."}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 group">
                <MapPinIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-400 text-sm group-hover:text-white transition-colors">
                  {settings?.contact?.address || "Bukidnon, Philippines"}
                </span>
              </div>

              <div className="flex items-center gap-3 group">
                <PhoneIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-400 text-sm group-hover:text-white transition-colors">
                  {settings?.contact?.phone || "+63 912 345 6789"}
                </span>
              </div>

              <div className="flex items-center gap-3 group">
                <MailIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-400 text-sm group-hover:text-white transition-colors">
                  {settings?.contact?.supportEmail || "info@bukidnontours.com"}
                </span>
              </div>
            </div>

            {/* Business Hours (visible in Footer) */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-2">Business Hours</h4>
              <div className="text-slate-400 text-sm space-y-1">
                <div>Mon–Fri: {settings?.businessHours?.weekday || '9:00 AM - 6:00 PM'}</div>
                <div>Saturday: {settings?.businessHours?.saturday || '9:00 AM - 5:00 PM'}</div>
                <div>Sunday: {settings?.businessHours?.sunday || 'Closed'}</div>
                {settings?.businessHours?.timezone && (
                  <div className="mt-1">Timezone: {settings.businessHours.timezone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
              <h4 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Quick Links
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-blue-400 rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/packages", label: "Packages" },
                { to: "/destinations", label: "Destinations" },
                { to: "/inquiry", label: "Send Inquiry" },
                { to: "/about", label: "About Us" }
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="text-slate-400 hover:text-blue-400 transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us & Legal */}
          <div>
              <h4 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Follow Us
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-blue-400 rounded-full"></div>
            </h4>
            
            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              {[
                { 
                  href: settings?.socialMedia?.facebook || "https://www.facebook.com/bukidnonupdates", 
                  icon: FacebookIcon, 
                  color: "hover:bg-blue-600 hover:border-blue-600",
                  label: "Facebook"
                },
                { 
                  href: settings?.socialMedia?.tiktok || "https://www.tiktok.com/@bukidnonupdates", 
                  icon: TiktokIcon, 
                  color: "hover:bg-black hover:border-black",
                  label: "TikTok"
                },
                { 
                  href: settings?.socialMedia?.instagram || "https://www.instagram.com/bukidnonupdatess", 
                  icon: InstagramIcon, 
                  color: "hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-rose-500 hover:border-transparent",
                  label: "Instagram"
                }
              ].map((social, _index) => (
                <a
                  key={_index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 border-2 border-slate-700 rounded-xl flex items-center justify-center text-slate-400 transition-all duration-300 transform hover:scale-110 hover:text-white ${social.color} group`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/50 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} {settings?.general?.siteName || "Bukidnon Tours"}. All rights reserved.
            </p>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <span className="text-slate-500 text-sm">ExploreBukidnon Travel & Adventures</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;