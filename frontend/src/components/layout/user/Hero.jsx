import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import { useSettings } from "../../../context/SettingsContext";
import heroImg from '../../../assets/images/bukid.jpg';

function Hero() {
  const { settings } = useSettings();
  const heroRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const siteName = settings?.general?.siteName || "Explore Bukidnon";
  const nameParts = siteName.split(" ");
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(" ") || "";

  // Lightweight scroll-based animation to create a subtle parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const heroHeight = heroRef.current?.offsetHeight || windowHeight;
      const progress = Math.min(scrollY / (heroHeight * 0.7), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => window.scrollTo({ top: window.innerHeight, behavior: "smooth" });

  const backgroundStyle = {
    transform: `translateY(${scrollProgress * -20}px) scale(${1 + scrollProgress * 0.02})`
  };

  const heroContentStyle = {
    opacity: 1 - scrollProgress * 1.5,
    transform: `translateY(${scrollProgress * 40}px)`
  };

  return (
    <section
      ref={heroRef}
      role="region"
      aria-label="Hero"
      className="relative h-screen min-h-[720px] flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Hero image is now an actual <img> so the browser can discover and prioritize it for LCP. */}
      <img
        src={heroImg}
        alt={settings?.general?.heroAlt || "Bukidnon landscape"}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        width="1920"
        height="1080"
        className="absolute inset-0 w-full h-full object-cover"
        style={backgroundStyle}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-900/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-transparent to-slate-900/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-transparent" />

      <div className="relative z-10 text-center text-white px-6 max-w-6xl mx-auto" style={heroContentStyle}>
        <div className="hero-badge inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/12 to-blue-500/12 backdrop-blur-lg border border-blue-300/20 rounded-2xl px-6 py-3 mb-8 shadow-sm relative overflow-hidden group hover:border-blue-300/40 transition-all duration-400">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/6 to-transparent skew-x-12 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-900" />

          <div>
            <MapPin className="w-5 h-5 text-blue-300" />
          </div>

          <span className="font-semibold text-sm tracking-widest uppercase text-slate-200">{settings?.contact?.address || "Bukidnon, Philippines"}</span>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>

        <div className="space-y-6 mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent blur-2xl rounded-full transform scale-125 -z-10" />

          <h1 className="hero-title-main text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05]">
            <span className="block text-white uppercase drop-shadow-sm">{firstPart}</span>
            <span className="hero-title-accent block text-blue-300 mt-3 uppercase drop-shadow-sm">{secondPart}</span>
          </h1>
        </div>

        <p className="hero-subtitle text-lg md:text-xl lg:text-2xl mt-6 mb-10 max-w-3xl mx-auto font-light leading-relaxed text-slate-200 drop-shadow-sm">
          {settings?.general?.tagline || (
            <>
              Discover <span className="text-blue-300 font-semibold">majestic highlands</span>, rich cultural heritage,
              and <span className="text-blue-300 font-semibold">unforgettable adventures</span> in Mindanao's most breathtaking paradise.
            </>
            )}
          </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <div>
            <Link
              to="/packages"
              aria-label="Explore packages"
              className="hero-cta-primary group inline-flex items-center justify-center gap-4 px-10 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 relative isolate z-20 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
            >
              <span className="flex items-center gap-3 relative z-10">
                Explore Packages
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-2" />
              </span>
            </Link>
          </div>

          <div>
            <Link
              to="/destinations"
              className="hero-cta-secondary flex items-center gap-4 px-10 py-4 rounded-full font-semibold text-white bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-blue-400/50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 group relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
              aria-label="View destinations"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <MapPin className="w-5 h-5 text-blue-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10" />
              <span className="relative z-10">View Destinations</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToContent}
        className="scroll-indicator absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-white/70 hover:text-white transition-all duration-300 group focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 rounded-full px-3 py-2"
        aria-label="Scroll to content"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium tracking-widest">Discover More</span>
          <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
        </div>
      </button>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
    </section>
  );
}

export default Hero;