import React, { createContext, useContext, useState, useEffect } from 'react';

const TripPlanningContext = createContext();

export const useTripPlanning = () => {
  const context = useContext(TripPlanningContext);
  if (!context) {
    throw new Error('useTripPlanning must be used within a TripPlanningProvider');
  }
  return context;
};

// Utility functions for coordinate conversion
const coordsToArray = (coords) => {
  if (!coords) return null;
  if (Array.isArray(coords)) return coords;
  if (typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
    return [coords.lat, coords.lng];
  }
  return null;
};

const coordsToObject = (coords) => {
  if (!coords) return null;
  if (Array.isArray(coords)) {
    return { lat: coords[0], lng: coords[1] };
  }
  if (typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
    return coords;
  }
  return null;
};

export const TripPlanningProvider = ({ children }) => {
  const [tripDetails, setTripDetails] = useState(() => {
    const saved = localStorage.getItem('tripDetails');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn('Error parsing saved trip details:', error);
      }
    }
    return {
      destination: '',
      startDate: '',
      endDate: '',
      budget: '10000',
      travelType: 'vacation',
      groupType: 'couple',
      groupSize: 2,
      interests: [],
      preferences: {
        accommodation: 'hotel',
        travelStyle: 'relaxed',
        foodPreference: 'all',
        dietaryPreferences: ['vegetarian'],
        budgetAllocation: {
          accommodation: 0.4,
          food: 0.3,
          transport: 0.2,
          activities: 0.1
        }
      },
      budgetBreakdown: null
    };
  });

  const [transportationDetails, setTransportationDetails] = useState({
    mode: 'public',
    options: [],
    selectedOptions: []
  });

  const [itinerary, setItinerary] = useState({
    days: [],
    totalCost: 0,
    warnings: [],
    recommendations: []
  });

  const [culturalInfo, setCulturalInfo] = useState({
    language: '',
    customs: [],
    phrases: [],
    emergencyContacts: {}
  });

  const [selectedAttractions, setSelectedAttractions] = useState(() => {
    const saved = localStorage.getItem('selectedAttractions');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      console.warn('Corrupt selectedAttractions in localStorage. Clearing.');
      localStorage.removeItem('selectedAttractions');
      return [];
    }
  });

  const [selectedRestaurants, setSelectedRestaurants] = useState(() => {
    const saved = localStorage.getItem('selectedRestaurants');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      console.warn('Corrupt selectedRestaurants in localStorage. Clearing.');
      localStorage.removeItem('selectedRestaurants');
      return [];
    }
  });

  const [selectedAccommodations, setSelectedAccommodations] = useState(() => {
    const saved = localStorage.getItem('selectedAccommodations');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      console.warn('Corrupt selectedAccommodations in localStorage. Clearing.');
      localStorage.removeItem('selectedAccommodations');
      return [];
    }
  });

  const [generatedItinerary, setGeneratedItinerary] = useState(() => {
    const saved = localStorage.getItem('generatedItinerary');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (_) {
      console.warn('Corrupt generatedItinerary in localStorage. Clearing.');
      localStorage.removeItem('generatedItinerary');
      return null;
    }
  });

  // Add logging for state changes and auto-save
  useEffect(() => {
    console.log('Trip Details Updated:', tripDetails);
    // Auto-save to localStorage
    localStorage.setItem('tripDetails', JSON.stringify(tripDetails));
  }, [tripDetails]);

  // Clear selected attractions when destination changes
  useEffect(() => {
    const prevDestination = localStorage.getItem('lastDestination');
    const currentDestination = tripDetails.destination;
    
    if (prevDestination && prevDestination !== currentDestination && currentDestination) {
      // Destination changed - clear previous selections
      console.log('Destination changed, clearing previous attractions');
      localStorage.removeItem('selectedAttractions');
      setSelectedAttractions([]);
    }
    
    if (currentDestination) {
      localStorage.setItem('lastDestination', currentDestination);
    }
  }, [tripDetails.destination]);

  // Auto-save selected attractions (only if destination hasn't changed)
  useEffect(() => {
    if (tripDetails.destination) {
      localStorage.setItem('selectedAttractions', JSON.stringify(selectedAttractions));
    }
  }, [selectedAttractions, tripDetails.destination]);

  // Auto-save selected restaurants
  useEffect(() => {
    localStorage.setItem('selectedRestaurants', JSON.stringify(selectedRestaurants));
  }, [selectedRestaurants]);

  // Auto-save selected accommodations
  useEffect(() => {
    localStorage.setItem('selectedAccommodations', JSON.stringify(selectedAccommodations));
  }, [selectedAccommodations]);

  // Auto-save generated itinerary
  useEffect(() => {
    if (generatedItinerary) {
      localStorage.setItem('generatedItinerary', JSON.stringify(generatedItinerary));
    }
  }, [generatedItinerary]);

  const updateTripDetails = (details) => {
    console.log('Updating Trip Details:', details);
    setTripDetails(prev => {
      const updated = {
        ...prev,
        ...details
      };
      return updated;
    });
  };

  const updateTransportation = (details) => {
    console.log('Updating Transportation:', details);
    setTransportationDetails(prev => ({
      ...prev,
      ...details
    }));
  };

  const updateItinerary = (details) => {
    console.log('Updating Itinerary:', details);
    setItinerary(prev => ({
      ...prev,
      ...details
    }));
  };

  const updateCulturalInfo = (info) => {
    console.log('Updating Cultural Info:', info);
    setCulturalInfo(prev => ({
      ...prev,
      ...info
    }));
  };

  const calculateTripDuration = () => {
    if (!tripDetails.startDate || !tripDetails.endDate) return 0;
    const start = new Date(tripDetails.startDate);
    const end = new Date(tripDetails.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const calculateBudgetPerDay = () => {
    const duration = calculateTripDuration();
    if (!duration) return 0;
    return Math.round(parseInt(tripDetails.budget) / duration);
  };

  const addAttraction = (attraction) => {
    setSelectedAttractions(prev => [...prev, attraction]);
  };

  const removeAttraction = (attractionId) => {
    setSelectedAttractions(prev => 
      prev.filter(attraction => attraction.id !== attractionId)
    );
  };

  const addRestaurant = (restaurant) => {
    setSelectedRestaurants(prev => [...prev, restaurant]);
  };

  const removeRestaurant = (restaurantId) => {
    setSelectedRestaurants(prev => 
      prev.filter(restaurant => restaurant.id !== restaurantId)
    );
  };

  const addAccommodation = (accommodation) => {
    setSelectedAccommodations(prev => [...prev, accommodation]);
  };

  const removeAccommodation = (accommodationId) => {
    setSelectedAccommodations(prev => 
      prev.filter(accommodation => accommodation.id !== accommodationId)
    );
  };

  const updateGeneratedItinerary = (itinerary) => {
    setGeneratedItinerary(itinerary);
  };

  const clearTripData = () => {
    console.log('Clearing all trip data');
    setTripDetails({
      destination: '',
      startDate: '',
      endDate: '',
      budget: '10000',
      travelType: 'vacation',
      groupType: 'couple',
      groupSize: 2,
      interests: [],
      preferences: {
        accommodation: 'hotel',
        travelStyle: 'relaxed',
        foodPreference: 'all'
      }
    });
    setTransportationDetails({
      mode: 'public',
      options: [],
      selectedOptions: []
    });
    setItinerary({
      days: [],
      totalCost: 0,
      warnings: [],
      recommendations: []
    });
    setCulturalInfo({
      language: '',
      customs: [],
      phrases: [],
      emergencyContacts: {}
    });
    setSelectedAttractions([]);
    setSelectedRestaurants([]);
    setSelectedAccommodations([]);
    setGeneratedItinerary(null);
    localStorage.removeItem('tripDetails');
    localStorage.removeItem('selectedAttractions');
    localStorage.removeItem('selectedRestaurants');
    localStorage.removeItem('selectedAccommodations');
    localStorage.removeItem('generatedItinerary');
  };

  const value = {
    tripDetails,
    setTripDetails,
    transportationDetails,
    itinerary,
    culturalInfo,
    selectedAttractions,
    selectedRestaurants,
    selectedAccommodations,
    generatedItinerary,
    updateTripDetails,
    updateTransportation,
    updateItinerary,
    updateCulturalInfo,
    calculateTripDuration,
    calculateBudgetPerDay,
    addAttraction,
    removeAttraction,
    addRestaurant,
    removeRestaurant,
    addAccommodation,
    removeAccommodation,
    updateGeneratedItinerary,
    clearTripData,
    coordsToArray,
    coordsToObject
  };

  return (
    <TripPlanningContext.Provider value={value}>
      {children}
    </TripPlanningContext.Provider>
  );
};

export default TripPlanningContext; 