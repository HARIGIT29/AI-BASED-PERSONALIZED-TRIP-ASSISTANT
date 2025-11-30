import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { useTripPlanning } from '../context/TripPlanningContext';
import { useNotification } from './ui/NotificationSystem';
import DestinationDetails from './DestinationDetails';
import DestinationRecommendations from './DestinationRecommendations';
import { searchDestinations, getPopularDestinations } from '../services/indianLocationsAPI';
import TravelTips from './TravelTips';
import ProgressBar from './ui/ProgressBar';

const TripDetailsForm = () => {
  const navigate = useNavigate();
  const { updateTripDetails } = useTripPlanning();
  const { success, error: showError } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const [errors, setErrors] = useState({});

  const [tripDetails, setTripDetails] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '5000',
    travelType: 'vacation',
    groupType: 'solo',
    groupSize: 1,
    interests: [],
    preferences: {
      accommodation: 'hotel',
      travelStyle: 'relaxed',
      foodPreference: 'all'
    }
  });

  const [suggestions, setSuggestions] = useState(() => {
    try {
      return getPopularDestinations().map(d => ({
        value: d.name,
        label: `${d.name}${d.state ? `, ${d.state}` : ''}`
      }));
    } catch (_) {
      return [];
    }
  });

  const interestOptions = [
    'Culture & History',
    'Nature & Outdoors',
    'Food & Cuisine',
    'Shopping',
    'Adventure Sports',
    'Arts & Museums',
    'Nightlife',
    'Relaxation'
  ];

  // Update suggestions as user types (search across India)
  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      try {
        const popular = getPopularDestinations().map(d => ({
          value: d.name,
          label: `${d.name}${d.state ? `, ${d.state}` : ''}`
        }));
        setSuggestions(popular);
      } catch (_) {
        setSuggestions([]);
      }
      return;
    }
    if (q.length < 2) return; // avoid noisy searches
    try {
      const results = searchDestinations(q).map(r => ({
        value: r.name,
        label: `${r.name}${r.state ? `, ${r.state}` : ''}`
      }));
      setSuggestions(results);
    } catch (_) {
      setSuggestions([]);
    }
  }, [searchTerm]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDestinationInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    setTripDetails(prev => ({
      ...prev,
      destination: value
    }));
    // Immediately update shared context so other views react without submit
    updateTripDetails({ destination: value });
  };

  const handleDestinationSelect = (dest) => {
    setTripDetails(prev => ({
      ...prev,
      destination: dest.value
    }));
    // Immediately update shared context on selection
    updateTripDetails({ destination: dest.value });
    setSearchTerm(dest.label);
    setShowDropdown(false);
    setShowDestinationDetails(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetSliderChange = (e) => {
    const value = e.target.value;
    setTripDetails(prev => ({
      ...prev,
      budget: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setTripDetails(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setTripDetails(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!tripDetails.destination) newErrors.destination = 'Destination is required';
    if (!tripDetails.startDate) newErrors.startDate = 'Start date is required';
    if (!tripDetails.endDate) newErrors.endDate = 'End date is required';
    if (tripDetails.startDate && tripDetails.endDate && new Date(tripDetails.startDate) > new Date(tripDetails.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!tripDetails.budget) newErrors.budget = 'Budget is required';
    if (tripDetails.budget < 5000) newErrors.budget = 'Budget must be at least ₹5,000';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate form completion progress
  const calculateProgress = () => {
    let completed = 0;
    const total = 7; // Total fields to check
    
    if (tripDetails.destination) completed++;
    if (tripDetails.startDate) completed++;
    if (tripDetails.endDate) completed++;
    if (tripDetails.budget && tripDetails.budget >= 5000) completed++;
    if (tripDetails.travelType) completed++;
    if (tripDetails.groupType && tripDetails.groupSize) completed++;
    if (tripDetails.interests && tripDetails.interests.length > 0) completed++;
    
    return (completed / total) * 100;
  };

  const handleSaveDraft = () => {
    try {
      updateTripDetails(tripDetails);
      success('Draft saved successfully!', { title: 'Draft Saved' });
    } catch (err) {
      console.error('Error saving draft:', err);
      showError('Failed to save draft. Please try again.', { title: 'Error' });
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      try {
        console.log('Submitting trip details:', tripDetails);
        updateTripDetails(tripDetails);
        success('Trip details saved successfully!', { title: 'Success' });
        navigate('/dashboard'); // Navigate to dashboard after successful submission
      } catch (err) {
        console.error('Error updating trip details:', err);
        showError('Failed to save trip details. Please try again.', { title: 'Error' });
      }
    } else {
      showError('Please fix the errors in the form before continuing.', { title: 'Validation Error' });
      console.log('Form validation failed');
    }
  };

  // Add new state for showing destination details
  const [showDestinationDetails, setShowDestinationDetails] = useState(false);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="travel-form-hero py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Plan Your Perfect Trip
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover welcoming destinations, gentle itineraries, and mindful budgeting all in one warm,
            AI-guided companion.
          </p>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="travel-form-shell p-6 sm:p-8 lg:p-12 backdrop-blur-md">
          {/* Progress Indicator */}
          <div className="mb-8">
            <ProgressBar 
              progress={calculateProgress()} 
              label="Form Completion"
              showPercentage={true}
            />
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-earth hover:text-[hsla(var(--sunset-peach)/1)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          <div className="space-y-10">
            {/* Destination Section */}
            <div className="travel-form-section relative" ref={dropdownRef}>
              <span className="travel-label">Destination</span>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleDestinationInput}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Where do you want to wander next?"
                  className="travel-input w-full pl-14 pr-4 py-4 text-lg"
                  style={{ paddingLeft: '3.5rem' }}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-earth">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              {showDropdown && (
                <div className="absolute z-20 w-full mt-4 bg-[#1B3A57] rounded-xl shadow-2xl max-h-60 overflow-auto border border-[rgba(255,255,255,0.2)] backdrop-blur">
                  {(suggestions || []).length === 0 ? (
                    <div className="px-4 py-3 text-white opacity-70">No results</div>
                  ) : (
                    suggestions.map(dest => (
                      <div
                        key={dest.value}
                        onClick={() => handleDestinationSelect(dest)}
                        className="px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] cursor-pointer transition-colors flex items-center gap-3 text-white"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white">{dest.label}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
              {errors.destination && (
                <p className="text-sm mt-2 text-[hsla(var(--destructive)/1)]">{errors.destination}</p>
              )}
            </div>

            {/* Dates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  label: 'Start Date',
                  name: 'startDate',
                  min: new Date().toISOString().split('T')[0],
                  value: tripDetails.startDate,
                },
                {
                  label: 'End Date',
                  name: 'endDate',
                  min: tripDetails.startDate || new Date().toISOString().split('T')[0],
                  value: tripDetails.endDate,
                },
              ].map(({ label, name, min, value }) => (
                <div key={name} className="travel-form-section">
                  <span className="travel-label">{label}</span>
                  <div className="relative">
                    <input
                      type="date"
                      name={name}
                      value={value}
                      onChange={handleInputChange}
                      min={min}
                      className="travel-input w-full pr-4 py-3"
                      style={{ paddingLeft: '3.5rem' }}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-sunset">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(errors.startDate || errors.endDate) && (
              <div className="p-3 bg-[hsla(var(--destructive)/0.1)] border border-[hsla(var(--destructive)/0.3)] rounded-lg">
                <p className="text-sm text-[hsla(var(--destructive)/1)] font-medium">
                  {errors.startDate || errors.endDate}
                </p>
              </div>
            )}

            {/* Budget Section with Slider */}
            <div className="travel-form-section space-y-4">
              <div className="flex items-center justify-between">
                <span className="travel-label">Budget (₹)</span>
                <span className="travel-subtle-pill">
                  <span className="text-earth font-semibold">₹{tripDetails.budget}</span>
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="1000"
                value={tripDetails.budget}
                onChange={handleBudgetSliderChange}
                className="travel-range w-full appearance-none cursor-pointer"
              />
              <div className="grid grid-cols-3 text-xs travel-subtle-text">
                <span>Essentials</span>
                <span className="text-center">Balanced</span>
                <span className="text-right">Indulgent</span>
              </div>
              {errors.budget && (
                <div className="mt-2 p-3 bg-[hsla(var(--destructive)/0.1)] border border-[hsla(var(--destructive)/0.3)] rounded-lg">
                  <p className="text-sm text-[hsla(var(--destructive)/1)] font-medium">{errors.budget}</p>
                </div>
              )}
            </div>

            {/* Trip Type and Group Type Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="travel-form-section space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-earth font-semibold">Trip Mood</span>
                  <span className="travel-subtle-text text-xs uppercase tracking-[0.25em]">Choose one</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['vacation', 'business', 'adventure', 'spiritual', 'educational'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleInputChange({ target: { name: 'travelType', value: type } })}
                      className={`travel-option ${
                        tripDetails.travelType === type ? 'travel-option-active' : ''
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="travel-form-section space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-earth font-semibold">Companions</span>
                  <span className="travel-subtle-text text-xs uppercase tracking-[0.25em]">Who’s going?</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['solo', 'couple', 'family', 'friends', 'group'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleInputChange({ target: { name: 'groupType', value: type } })}
                      className={`travel-option ${
                        tripDetails.groupType === type ? 'travel-option-active' : ''
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <span className="travel-label tracking-[0.2em]">Number of Travelers</span>
                  <input
                    type="number"
                    name="groupSize"
                    min="1"
                    max="20"
                    value={tripDetails.groupSize || 1}
                    onChange={handleInputChange}
                    className="travel-input w-full px-4 py-3"
                    placeholder="Enter number of travelers"
                  />
                  <p className="text-xs travel-subtle-text">
                    Share how many people you’ll be traveling with.
                  </p>
                </div>
              </div>
            </div>

            {/* Interests Section */}
            <div className="travel-form-section space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-earth font-semibold">What interests you?</span>
                <span className="travel-subtle-text text-xs uppercase tracking-[0.25em]">
                  Pick everything that sparks joy
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {interestOptions.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`travel-interest ${
                      tripDetails.interests.includes(interest) ? 'travel-interest-active' : ''
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Preferences Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  label: 'Accommodation',
                  name: 'accommodation',
                  options: ['hotel', 'resort', 'hostel', 'apartment', 'homestay'],
                },
                {
                  label: 'Travel Style',
                  name: 'travelStyle',
                  options: ['relaxed', 'moderate', 'intense', 'luxury', 'budget'],
                },
                {
                  label: 'Food Preference',
                  name: 'foodPreference',
                  options: ['all', 'vegetarian', 'vegan', 'halal', 'local'],
                },
              ].map(({ label, name, options }) => (
                <div key={name} className="travel-form-section space-y-3">
                  <span className="text-earth font-semibold">{label}</span>
                  <select
                    name={name}
                    value={tripDetails.preferences[name]}
                    onChange={handlePreferenceChange}
                    className="travel-input w-full px-4 py-3"
                  >
                    {options.map(option => (
                      <option key={option} value={option}>
                        {option === 'all'
                          ? 'All types'
                          : option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleSaveDraft}
                className="travel-pill inline-flex items-center justify-center gap-2 text-base font-medium px-6 py-3 bg-misty text-earth hover:opacity-85 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                className="travel-button inline-flex items-center justify-center gap-3 text-lg font-semibold px-10 py-4"
              >
                Continue to Dashboard
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Destination Details + Attractions */}
        {showDestinationDetails && tripDetails.destination && (
          <div className="mt-12 space-y-10">
            <DestinationDetails destination={tripDetails.destination} />
            <div className="travel-section">
              <DestinationRecommendations 
                tripDetails={tripDetails}
                setCurrentStep={() => {}}
              />
            </div>
            <div className="travel-section">
              <TravelTips 
                destination={tripDetails.destination}
                tripType={tripDetails.travelType}
                startDate={tripDetails.startDate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetailsForm; 