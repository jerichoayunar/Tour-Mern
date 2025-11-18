// hooks/useDestinations.js

/**
 * CUSTOM HOOK: useDestinations
 * 
 * WHAT THIS DOES:
 * - Manages loading, error, and data states for destinations
 * - Handles the data fetching lifecycle
 * - Provides clean interface for components to consume destinations data
 * - Reusable across multiple components that need destinations data
 * 
 * CONNECTED TO:
 * - destinationService.js (calls its functions)
 * - Any component that needs destinations data (like DestinationsContent)
 */

import { useState, useEffect } from 'react';
import { destinationService } from '../services/destinationService';

export function useDestinations() {
  // State management for destinations data
  const [destinations, setDestinations] = useState([]);    // Actual destinations data
  const [loading, setLoading] = useState(true);            // Loading state
  const [error, setError] = useState(null);                // Error state

  useEffect(() => {
    /**
     * FETCH DESTINATIONS DATA
     * - Called automatically when component using this hook mounts
     * - Handles the entire data fetching process
     * - Updates all three states (loading, error, data)
     */
    const fetchDestinations = async () => {
      try {
        // Get data from service layer
        const response = await destinationService.getAll();
        setDestinations(response.data); // Extract the array
        setError(null); // Clear any previous errors
        
      } catch (err) {
        // Handle any errors that occurred
        console.error('Error fetching destinations:', err);
        setError(err.message);
        setDestinations([]); // Reset data on error
        
      } finally {
        // Always turn off loading regardless of success/error
        setLoading(false);
      }
    };

    // Execute the fetch
    fetchDestinations();
  }, []); // Empty dependency array = run only once on mount

  // Return state for components to use
  return { destinations, loading, error };
}