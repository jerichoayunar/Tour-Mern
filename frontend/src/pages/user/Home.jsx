// src/pages/Home.jsx
import React from 'react';
import { useDestinations } from '../../hooks/useDestinations';
import Hero from "../../components/layout/user/Hero";
import DestinationsContent from "../../components/user/DestinationsContent";

function Home() {
  const { destinations, loading, error } = useDestinations();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Destinations Section */}
      <DestinationsContent 
        destinations={destinations}
        loading={loading}
        error={error}
      />

      {/* Optional: Features Section */}
      {/* <FeaturesSection /> */}

      {/* Optional: Testimonials Section */}
      {/* <TestimonialsSection /> */}

      {/* Optional: Newsletter Section */}
      {/* <NewsletterSection /> */}
    </div>
  );
}

export default Home;