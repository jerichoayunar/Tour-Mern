import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  Award, 
  Heart, 
  Globe, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import LazyImage from '../../components/ui/LazyImage';

const About = () => {
  const stats = [
    { label: 'Years of Experience', value: '5+' },
    { label: 'Happy Travelers', value: '10k+' },
    { label: 'Destinations', value: '50+' },
    { label: 'Local Guides', value: '20+' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion for Travel',
      description: 'We are travelers at heart, passionate about sharing the beauty of Bukidnon with the world.'
    },
    {
      icon: ShieldCheck,
      title: 'Safety First',
      description: 'Your safety is our top priority. We work with certified guides and ensure all protocols are followed.'
    },
    {
      icon: Globe,
      title: 'Sustainable Tourism',
      description: 'We believe in responsible travel that respects local cultures and preserves the environment.'
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'We support local communities by employing local guides and partnering with local businesses.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <LazyImage
            src="/images/destinations/bukidnonupdates.jpg" // Fallback or specific hero image
            alt="Bukidnon Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            About Us
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto font-light">
            Discovering the hidden gems of Bukidnon, one adventure at a time.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-100 rounded-full -z-10" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100 rounded-full -z-10" />
                <LazyImage
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Our Journey"
                  className="rounded-2xl shadow-xl w-full h-[500px] object-cover"
                />
              </div>
            </div>
            
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 font-semibold rounded-full text-sm">
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                We Help You Experience the <span className="text-primary-600">Real Bukidnon</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Founded in 2020, Bukidnon Tours started with a simple mission: to showcase the breathtaking landscapes and rich culture of Bukidnon to the world. What began as a small group of local enthusiasts has grown into a premier travel agency dedicated to creating unforgettable experiences.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                We believe that travel is not just about seeing new places, but about connecting with people and nature. Our carefully curated packages are designed to immerse you in the local way of life, from the misty mountains of Malaybalay to the vibrant traditions of the indigenous tribes.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-6">
                {stats.map((stat, _index) => (
                    <div key={_index} className="border-l-4 border-primary-500 pl-4">
                    <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-slate-600 text-lg">
              We go the extra mile to ensure your journey is safe, comfortable, and truly memorable. Here's what sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, _index) => (
              <div 
                key={_index} 
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-6 text-primary-600">
                  <value.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Start Your Adventure?
              </h2>
              <p className="text-xl text-primary-100 mb-10">
                Join us and explore the wonders of Bukidnon. Create memories that will last a lifetime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/packages" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg"
                >
                  Explore Packages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
