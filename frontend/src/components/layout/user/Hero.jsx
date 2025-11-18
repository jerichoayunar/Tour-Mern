// src/components/Hero.jsx - CLEAN WITHOUT PARTICLES & DECORATIONS
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function Hero() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const bgRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main timeline with enhanced animations
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Background scale-in with blur
      tl.fromTo(bgRef.current, 
        { 
          scale: 1.3, 
          opacity: 0,
          filter: "blur(20px)"
        },
        { 
          scale: 1, 
          opacity: 1, 
          filter: "blur(0px)",
          duration: 2,
          ease: "power2.inOut"
        }
      );

      // Enhanced badge animation with 3D effect
      tl.fromTo(".hero-badge", 
        { 
          y: -80, 
          opacity: 0, 
          scale: 0.5,
          rotationX: 90,
          filter: "blur(10px)"
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          rotationX: 0,
          filter: "blur(0px)",
          duration: 1.2, 
          ease: "back.out(2)" 
        }, 
        "-=1.5"
      );

      // Title animations with character splitting effect
      tl.fromTo(".hero-title-main", 
        { 
          y: 120, 
          opacity: 0,
          skewY: 15,
          filter: "blur(10px)"
        },
        { 
          y: 0, 
          opacity: 1, 
          skewY: 0,
          filter: "blur(0px)",
          duration: 1.4 
        }, 
        "-=0.8"
      );

      // Enhanced gradient text with glow
      tl.fromTo(".hero-title-accent", 
        { 
          y: 120, 
          opacity: 0,
          scale: 1.3,
          filter: "blur(15px) brightness(2)"
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          filter: "blur(0px) brightness(1)",
          duration: 1.6 
        }, 
        "-=1.0"
      );

      // Subtitle with typewriter effect simulation
      tl.fromTo(".hero-subtitle", 
        { 
          y: 60, 
          opacity: 0,
          filter: "blur(10px)",
          clipPath: "inset(0 100% 0 0)"
        },
        { 
          y: 0, 
          opacity: 1, 
          filter: "blur(0px)",
          clipPath: "inset(0 0% 0 0)",
          duration: 1.2 
        }, 
        "-=1.2"
      );

      // CTA buttons with staggered 3D flip
      tl.fromTo(".hero-cta", 
        { 
          y: 60, 
          opacity: 0,
          rotationY: 90,
          scale: 0.8
        },
        { 
          y: 0, 
          opacity: 1, 
          rotationY: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.3,
          ease: "back.out(1.5)" 
        }, 
        "-=0.8"
      );

      // Scroll indicator with bounce
      tl.fromTo(".scroll-indicator", 
        { 
          y: 40, 
          opacity: 0,
          scale: 0.5
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)" 
        }, 
        "-=0.4"
      );

      // Continuous animations
      // Gradient text flow
      gsap.to(".hero-title-accent", {
        backgroundPosition: "200% 50%",
        duration: 6,
        ease: "none",
        repeat: -1
      });

      // Enhanced pulse for icons
      gsap.to(".pulse-icon", {
        scale: 1.3,
        opacity: 0.7,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5
      });

      // Scroll-triggered animations
      if (typeof ScrollTrigger !== 'undefined') {
        // Enhanced parallax with multiple layers
        gsap.to(bgRef.current, {
          yPercent: -30,
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5
          }
        });

        // Content fade out with perspective
        gsap.to(contentRef.current, {
          opacity: 0,
          y: 150,
          scale: 0.8,
          rotationX: 10,
          ease: "power2.in",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1
          }
        });

        // Scroll indicator fade with scale
        gsap.to(".scroll-indicator", {
          opacity: 0,
          y: 30,
          scale: 0.8,
          ease: "power2.in",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "center top",
            scrub: 1
          }
        });
      }

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToContent = () => {
    if (typeof ScrollToPlugin !== 'undefined') {
      gsap.to(window, {
        duration: 1.8,
        scrollTo: window.innerHeight,
        ease: "power3.inOut"
      });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-black"
    >
      
      {/* Enhanced Background */}
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform-gpu"
        style={{ 
          backgroundImage: "url('../src/assets/images/bukid.jpg')"
        }}
      />

      {/* Advanced Overlay Layering */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/80"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent"></div>

      {/* Main Content with Enhanced Styling */}
      <div 
        ref={contentRef}
        className="relative z-10 text-center text-white px-6 max-w-6xl mx-auto transform-gpu"
      >
        {/* Enhanced Location Badge */}
        <div className="hero-badge inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-2xl border border-amber-400/30 rounded-2xl px-8 py-4 mb-12 shadow-2xl relative overflow-hidden group hover:border-amber-300/50 transition-all duration-500">
          {/* Animated background shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          
          <MapPin className="w-5 h-5 text-amber-300 pulse-icon" />
          <span className="font-bold text-sm tracking-widest uppercase bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            Bukidnon, Philippines
          </span>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        </div>

        {/* Enhanced Heading with Glow Effect */}
        <div className="space-y-6 mb-8 relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-amber-400/5 blur-3xl rounded-full transform scale-150 -z-10"></div>
          
          <h1 className="hero-title-main text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]">
            <span className="block drop-shadow-2xl bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
              EXPLORE
            </span>
            <span className="hero-title-accent block bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-2xl bg-[length:200%_auto] mt-4">
              BUKIDNON
            </span>
          </h1>
        </div>

        {/* Enhanced Subtitle */}
        <p className="hero-subtitle text-xl md:text-2xl lg:text-3xl mt-8 mb-12 max-w-4xl mx-auto font-light leading-relaxed bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
          Discover <span className="text-amber-300 font-semibold">majestic highlands</span>, rich cultural heritage, 
          and <span className="text-orange-300 font-semibold">unforgettable adventures</span> in Mindanao's most breathtaking paradise.
        </p>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          {/* Primary CTA with Enhanced Effects */}
          <Link
            to="/packages"
            className="hero-cta group px-12 py-5 rounded-2xl font-bold text-xl 
                       bg-gradient-to-r from-amber-500 to-orange-500
                       hover:from-amber-400 hover:to-orange-400 
                       shadow-2xl hover:shadow-amber-500/25
                       transform hover:scale-105 hover:skew-x-1
                       transition-all duration-500 relative overflow-hidden"
          >
            <span className="flex items-center gap-4 relative z-10">
              Explore Packages
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
            </span>

            {/* Enhanced shine effect */}
            <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] 
                            bg-gradient-to-r from-transparent via-white/40 to-transparent 
                            skew-x-12 transition-all duration-1000"></div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-xl group-hover:blur-2xl transition-all duration-500 -z-10"></div>
          </Link>

          {/* Enhanced Secondary CTA */}
          <Link
            to="/destinations"
            className="hero-cta flex items-center gap-4 px-10 py-5 rounded-2xl font-semibold text-lg 
                       bg-white/10 backdrop-blur-2xl border border-white/20 
                       hover:bg-white/20 hover:border-amber-400/50
                       shadow-xl hover:shadow-2xl 
                       transform hover:scale-105 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Background shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            <MapPin className="w-5 h-5 text-amber-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10" />
            <span className="relative z-10">View Destinations</span>
            <div className="w-2 h-2 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10"></div>
          </Link>
        </div>
      </div>

      {/* Clean Scroll Down Indicator */}
      <button
        onClick={scrollToContent}
        className="scroll-indicator absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-white/70 hover:text-white transition-all duration-300 group"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium tracking-widest">Discover More</span>
          <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
        </div>
      </button>

      {/* Enhanced Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
    </section>
  );
}

export default Hero;