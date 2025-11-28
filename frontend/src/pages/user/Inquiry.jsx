import React from 'react';
import InquiryForm from '../../components/user/inquiry/InquiryForm';
import { ShieldCheck, Headphones, Map, CreditCard } from 'lucide-react';

const Inquiry = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Contact Us
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Have questions about our tours or need a custom package? We're here to help you plan your perfect getaway.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <InquiryForm />
          </div>

          {/* Info Section */}
          <div className="space-y-6">
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
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">Get in Touch</h3>
              <div className="space-y-2 text-white/90">
                <p className="text-sm">📍 Malaybalay City, Bukidnon</p>
                <p className="text-sm">📞 +63 912 345 6789</p>
                <p className="text-sm">✉️ info@bukidnontours.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inquiry;
