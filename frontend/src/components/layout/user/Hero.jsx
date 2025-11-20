import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSettings } from "../../../context/SettingsContext";

function Hero() {
  const { settings } = useSettings();
  const heroRef = useRef(null);

  // Split site name for styling
  const siteName = settings?.general?.siteName || "Explore Bukidnon";
  const nameParts = siteName.split(" ");
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(" ") || "";

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const contentScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      ref={heroRef}
      className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-black"
    >
      
      {/* Enhanced Background */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform-gpu"
        style={{ 
          backgroundImage: "url('../src/assets/images/bukid.jpg')",
          y: bgY,
          scale: bgScale
        }}
        initial={{ scale: 1.3, opacity: 0, filter: "blur(20px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Advanced Overlay Layering */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/80"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent"></div>

      {/* Main Content with Enhanced Styling */}
      <motion.div 
        className="relative z-10 text-center text-white px-6 max-w-6xl mx-auto transform-gpu"
        style={{ opacity: contentOpacity, y: contentY, scale: contentScale }}
      >
        {/* Enhanced Location Badge */}
        <motion.div 
          className="hero-badge inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-2xl border border-amber-400/30 rounded-2xl px-8 py-4 mb-12 shadow-2xl relative overflow-hidden group hover:border-amber-300/50 transition-all duration-500"
          initial={{ y: -80, opacity: 0, scale: 0.5, rotateX: 90, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "backOut", delay: 0.5 }}
        >
          {/* Animated background shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <MapPin className="w-5 h-5 text-amber-300" />
          </motion.div>
          <span className="font-bold text-sm tracking-widest uppercase bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            {settings?.contact?.address || "Bukidnon, Philippines"}
          </span>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        </motion.div>

        {/* Enhanced Heading with Glow Effect */}
        <div className="space-y-6 mb-8 relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-amber-400/5 blur-3xl rounded-full transform scale-150 -z-10"></div>
          
          <h1 className="hero-title-main text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]">
            <motion.span 
              className="block drop-shadow-2xl bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent uppercase"
              initial={{ y: 120, opacity: 0, skewY: 15, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, skewY: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.4, delay: 0.8 }}
            >
              {firstPart}
            </motion.span>
            <motion.span 
              className="hero-title-accent block bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-2xl bg-[length:200%_auto] mt-4 uppercase"
              initial={{ y: 120, opacity: 0, scale: 1.3, filter: "blur(15px) brightness(2)" }}
              animate={{ 
                y: 0, 
                opacity: 1, 
                scale: 1, 
                filter: "blur(0px) brightness(1)",
                backgroundPosition: ["0% 50%", "200% 50%"]
              }}
              transition={{ 
                y: { duration: 1.6, delay: 1.0 },
                opacity: { duration: 1.6, delay: 1.0 },
                scale: { duration: 1.6, delay: 1.0 },
                filter: { duration: 1.6, delay: 1.0 },
                backgroundPosition: { duration: 6, repeat: Infinity, ease: "linear" }
              }}
            >
              {secondPart}
            </motion.span>
          </h1>
        </div>

        {/* Enhanced Subtitle */}
        <motion.p 
          className="hero-subtitle text-xl md:text-2xl lg:text-3xl mt-8 mb-12 max-w-4xl mx-auto font-light leading-relaxed bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent"
          initial={{ y: 60, opacity: 0, filter: "blur(10px)", clipPath: "inset(0 100% 0 0)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.2, delay: 1.2 }}
        >
          {settings?.general?.tagline || (
            <>
              Discover <span className="text-amber-300 font-semibold">majestic highlands</span>, rich cultural heritage, 
              and <span className="text-orange-300 font-semibold">unforgettable adventures</span> in Mindanao's most breathtaking paradise.
            </>
          )}
        </motion.p>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          {/* Primary CTA with Enhanced Effects */}
          <motion.div
            initial={{ y: 60, opacity: 0, rotateY: 90, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, rotateY: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "backOut" }}
          >
            <Link
              to="/packages"
              className="hero-cta group px-12 py-5 rounded-2xl font-bold text-xl 
                         bg-gradient-to-r from-amber-500 to-orange-500
                         hover:from-amber-400 hover:to-orange-400 
                         shadow-2xl hover:shadow-amber-500/25
                         transform hover:scale-105 hover:skew-x-1
                         transition-all duration-500 relative overflow-hidden block"
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
          </motion.div>

          {/* Enhanced Secondary CTA */}
          <motion.div
            initial={{ y: 60, opacity: 0, rotateY: 90, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, rotateY: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.7, ease: "backOut" }}
          >
            <Link
              to="/destinations"
              className="hero-cta flex items-center gap-4 px-10 py-5 rounded-2xl font-semibold text-lg 
                         bg-white/10 backdrop-blur-2xl border border-white/20 
                         hover:bg-white/20 hover:border-amber-400/50
                         shadow-xl hover:shadow-2xl 
                         transform hover:scale-105 transition-all duration-500 group relative overflow-hidden block"
            >
              {/* Background shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <MapPin className="w-5 h-5 text-amber-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10" />
              <span className="relative z-10">View Destinations</span>
              <div className="w-2 h-2 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10"></div>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Clean Scroll Down Indicator */}
      <motion.button
        onClick={scrollToContent}
        className="scroll-indicator absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-white/70 hover:text-white transition-all duration-300 group"
        initial={{ y: 40, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 2.0, ease: "backOut" }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium tracking-widest">Discover More</span>
          <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
        </div>
      </motion.button>

      {/* Enhanced Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
    </section>
  );
}

export default Hero;