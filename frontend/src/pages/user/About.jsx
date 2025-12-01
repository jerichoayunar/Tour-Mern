import React from 'react';
import { useSettings } from '../../context/SettingsContext';
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
  const { settings } = useSettings();
  const about = settings?.aboutUs || {};

  const stats = [
    { label: 'Years of Experience', value: about?.stats?.yearsExperience || '10+' },
    { label: 'Happy Travelers', value: about?.stats?.happyTravelers || '2,500+' },
    { label: 'Destinations', value: about?.stats?.destinations || '50+' },
    { label: 'Tour Packages', value: about?.stats?.tourPackages || '150+' },
  ];

  // If admin provided editable values, prefer those
  // Map icon key strings (case-insensitive) to lucide-react components
  const iconMap = {
    heart: Heart,
    shieldcheck: ShieldCheck,
    globe: Globe,
    users: Users,
    mappin: MapPin,
    mapPin: MapPin,
    map_pin: MapPin,
    award: Award,
    arrowright: ArrowRight,
    arrow_right: ArrowRight
  };

  const valuesFromSettings = (about.values && Array.isArray(about.values) && about.values.length)
    ? about.values.map((v) => {
        // allow admin to pass either a string key or a component
        let IconComponent = Heart;
        if (v && v.icon) {
          if (typeof v.icon === 'string') {
            const key = v.icon.replace(/\s|_|-/g, '').toLowerCase();
            IconComponent = iconMap[key] || Heart;
          } else if (typeof v.icon === 'object' || typeof v.icon === 'function') {
            IconComponent = v.icon;
          }
        }
        return { icon: IconComponent, title: v.title, description: v.description };
      })
    : [];

  const values = valuesFromSettings.length ? valuesFromSettings : [
    {
      icon: Heart,
      title: 'Passion for Travel',
      description: 'We are travelers at heart — passionate about sharing Bukidnon’s natural beauty and culture with curious explorers.'
    },
    {
      icon: ShieldCheck,
      title: 'Safety First',
      description: 'Your safety is our priority. We partner with certified guides and follow best practices so you can travel with confidence.'
    },
    {
      icon: Globe,
      title: 'Sustainable Tourism',
      description: 'We practice responsible tourism that respects local cultures and protects the natural environment for future generations.'
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'We create local impact by hiring community guides and partnering with small businesses and artisans.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Hero */}
      <header
        className="relative border-b border-slate-100"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(2,6,23,0.56), rgba(2,6,23,0.28)), url('/images/destinations/monastery.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        role="region"
        aria-labelledby="about-hero-title"
      >
        <div className="container mx-auto px-6 py-36 text-center text-white">
          <h1 id="about-hero-title" className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg leading-tight">
            {about.heroTitle || 'About Bukidnon Tours'}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-primary-100 mx-auto max-w-3xl leading-relaxed">
            {about.heroSubtitle || "Authentic, locally guided experiences that reveal Bukidnon's landscapes and culture."}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        {/* Intro: image + text */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-slate-700 leading-relaxed mb-4 max-w-prose">
              {about.whoWeAre || 'Founded in 2020 by local travelers and guides, we craft thoughtful journeys that reveal Bukidnon’s misty mountains, waterfalls, and traditions.'}
            </p>
            <p className="text-slate-700 leading-relaxed max-w-prose">
              {about.mission || 'We focus on meaningful travel — experiences that connect people with nature and communities, and that leave a positive impact.'}
            </p>
          </div>

          <div className="order-1 lg:order-2">
            <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <LazyImage
                src="/images/destinations/communal.jpg"
                alt={about.heroTitle || 'Bukidnon landscape'}
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-xl p-6 text-center transform transition hover:-translate-y-1">
              <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white border border-slate-100 rounded-lg p-8">
            <h3 className="text-lg font-semibold mb-2">Mission</h3>
            <p className="text-slate-600">{about.mission || 'Create thoughtful, sustainable travel experiences that connect visitors with Bukidnon’s landscapes and communities.'}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-lg p-8">
            <h3 className="text-lg font-semibold mb-2">Vision</h3>
            <p className="text-slate-600">{about.vision || 'To be the trusted partner for travelers seeking authentic Bukidnon experiences — known for quality and positive local impact.'}</p>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold">Why Choose Us</h3>
              <p className="text-slate-500">What sets our tours apart</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <article key={idx} className="bg-white/95 border border-slate-100 rounded-2xl p-6 flex flex-col items-start gap-4 h-full hover:shadow-lg transition-shadow transform hover:-translate-y-1" aria-labelledby={`value-title-${idx}`}>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600">
                  <value.icon size={20} aria-hidden="true" />
                </div>
                <h4 id={`value-title-${idx}`} className="text-md font-semibold">{value.title}</h4>
                <p className="text-sm text-slate-600">{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-lg p-8 text-center text-white" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 50%, rgba(129,140,248,1) 100%)' }}>
          <h3 className="text-2xl font-bold mb-2">Ready to explore Bukidnon?</h3>
          <p className="mb-4 text-primary-100">Join us for an authentic journey — crafted with care by local guides.</p>
          <Link to="/packages" aria-label="Explore packages" className="inline-flex items-center gap-3 bg-white text-slate-800 px-6 py-3 rounded-md font-semibold shadow-md">
            <span className="leading-none">Explore Packages</span>
            <ArrowRight size={18} className="text-slate-800" />
          </Link>
        </section>
      </main>
    </div>
  );
};

export default About;
