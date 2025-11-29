import React from 'react';
import InquiryForm from '../../components/user/inquiry/InquiryForm';
import { ShieldCheck, Headphones, Map, CreditCard, Phone, Mail } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const Inquiry = () => {
  const { settings } = useSettings();

  const contact = settings?.contact || {};
  const supportEmail = contact.supportEmail || contact.email || 'supportemail@tourbook.com';
  const phone = contact.phone || '+63 9480492557';
  const address = contact.address || 'p-6';

  return (
    <div className="relative min-h-screen">
      {/* Background: match Packages page (non-snow mountain) */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2340&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-800/80 to-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/5 via-transparent to-slate-50/10" />
      </div>

      <main className="page-bg-auth relative min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        {/* Full-width decorative background behind the inquiry content */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1800&q=80')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
            zIndex: 0
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <header className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Contact Us</h1>
            <p className="text-base text-black-600 max-w-2xl mx-auto">
              Have questions about our tours or need a custom package? We're here to help you plan your perfect
              getaway.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <InquiryForm />
            </div>

            {/* Info Section */}
            <aside className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Book With Us?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Headphones size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">24/7 Support</h4>
                      <p className="text-sm text-gray-500">Always here to help you</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Best Prices</h4>
                      <p className="text-sm text-gray-500">Guaranteed best rates</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Map size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Local Experts</h4>
                      <p className="text-sm text-gray-500">Guides who know the land</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Secure Booking</h4>
                      <p className="text-sm text-gray-500">100% secure payments</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="relative overflow-hidden rounded-2xl shadow-md p-6 text-white bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                        <Map className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Address</div>
                        <div className="text-sm text-white/90">{address}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Phone</div>
                        <div className="text-sm text-white/90">{phone}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Support Email</div>
                        <div className="text-sm text-white/90">{supportEmail}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inquiry;
