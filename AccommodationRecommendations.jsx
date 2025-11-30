import React, { useState, useEffect } from 'react';
import { useTripPlanning } from '../../context/TripPlanningContext';
import { calculateBudgetSplit } from '../../utils/helpers';
import { fetchHotels, discoverLodging } from '../../services/api';
import { getDestinationDetails } from '../../services/indianLocationsAPI';
import AccommodationDetailModal from './AccommodationDetailModal';
import EmptyState from '../ui/EmptyState';

const AccommodationRecommendations = () => {
  const { tripDetails, selectedAccommodations, addAccommodation, removeAccommodation, calculateTripDuration } = useTripPlanning();
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: 'all',
    rating: 0,
    amenities: []
  });

  useEffect(() => {
    loadAccommodations();
  }, [tripDetails.destination, tripDetails.budget, tripDetails.groupSize, tripDetails.startDate, tripDetails.endDate]);

  const loadAccommodations = async () => {
    setLoading(true);
    setError(null);
    try {
      const start = tripDetails.startDate ? new Date(tripDetails.startDate) : null;
      const end = tripDetails.endDate ? new Date(tripDetails.endDate) : null;
      const durationDays = start && end ? Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))) : 1;

      const totalBudget = parseInt(tripDetails.budget || '0', 10);
      const groupSize = Math.max(1, parseInt(tripDetails.groupSize || '1', 10));
      const perGroupBudget = totalBudget;
      const { nightlyAccommodationCap } = calculateBudgetSplit({
        totalBudget: perGroupBudget,
        durationDays,
        preferences: tripDetails.preferences
      });

      const rooms = Math.max(1, Math.ceil(groupSize / 2));
      let perNightCap = Math.floor(nightlyAccommodationCap / rooms);
      if (!Number.isFinite(perNightCap) || perNightCap <= 0) {
        perNightCap = 2000;
      }

      const checkin = start ? start.toISOString().slice(0, 10) : '';
      const checkout = end ? end.toISOString().slice(0, 10) : '';

      console.log('Loading accommodations for:', {
        destination: tripDetails.destination,
        checkin,
        checkout,
        adults: groupSize,
        rooms,
        maxPrice: perNightCap
      });

      // Use the main accommodation search endpoint which has proper pricing logic
      console.log('Fetching accommodations with proper pricing...');
      const response = await fetchHotels({
        destination: tripDetails.destination,
        checkin,
        checkout,
        adults: groupSize,
        rooms,
        maxPrice: perNightCap
      });

      console.log('Accommodation response:', response);
      console.log('Response source:', response.source || response.meta?.source || 'unknown');
      console.log('Response has hotels:', !!response.hotels);
      console.log('Response has accommodations:', !!response.accommodations);
      console.log('Response is array:', Array.isArray(response));
      
      // Initialize accommodations array
      let accommodations = [];
      
      // Helper function to normalize accommodation data
      const normalizeAccommodation = (hotel) => ({
        id: hotel.id || hotel.place_id || hotel.hotel_id || `acc_${Math.random().toString(36).substr(2, 9)}`,
        name: hotel.name || hotel.hotel_name || 'Hotel',
        price: hotel.price || hotel.min_total_price || hotel.rate || 2000,
        rating: hotel.rating || hotel.review_score || hotel.star_rating || 0,
        image: hotel.imageUrl || hotel.photoUrl || hotel.image || hotel.max_photo_url || hotel.main_photo_url || '',
        location: hotel.address || hotel.location || hotel.city_trans || tripDetails.destination,
        amenities: hotel.amenities || hotel.facilities || ['Free WiFi', 'Parking'],
        type: hotel.type || hotel.accommodation_type || 'Hotel',
        description: hotel.description || `${hotel.name || 'Hotel'} in ${tripDetails.destination}`,
        address: hotel.address || hotel.location || hotel.city_trans || tripDetails.destination,
        coordinates: hotel.coordinates || (hotel.latitude && hotel.longitude ? [hotel.latitude, hotel.longitude] : []),
        reviews: hotel.reviews || hotel.userRatingsTotal || hotel.review_nr || 0,
        source: hotel.source || response.source || response.meta?.source || 'api'
      });
      
      // Handle case where response is directly an array
      if (Array.isArray(response)) {
        console.log(`✅ Response is array with ${response.length} items`);
        accommodations = response.map(normalizeAccommodation);
      } 
      // Prioritize accommodations array over hotels array
      else if (response.accommodations && Array.isArray(response.accommodations)) {
        console.log(`✅ Processing ${response.accommodations.length} accommodations from response.accommodations`);
        accommodations = response.accommodations.map(normalizeAccommodation);
      } 
      // Fallback to hotels array
      else if (response.hotels && Array.isArray(response.hotels)) {
        console.log(`✅ Processing ${response.hotels.length} hotels from response.hotels`);
        accommodations = response.hotels.map(normalizeAccommodation);
      }
      // Check if data property exists (wrapped response)
      else if (response.data) {
        const data = response.data;
        if (data.accommodations && Array.isArray(data.accommodations)) {
          console.log(`✅ Processing ${data.accommodations.length} accommodations from response.data.accommodations`);
          accommodations = data.accommodations.map(normalizeAccommodation);
        } else if (data.hotels && Array.isArray(data.hotels)) {
          console.log(`✅ Processing ${data.hotels.length} hotels from response.data.hotels`);
          accommodations = data.hotels.map(normalizeAccommodation);
        }
      }
      
      // Filter by budget and ensure prices are valid
      // Only filter if we have accommodations, and be more lenient with price validation
      if (accommodations.length > 0) {
        const beforeFilter = accommodations.length;
        accommodations = accommodations.filter(acc => {
          // If price is missing or invalid, assign a default based on budget
          if (!acc.price || acc.price <= 0) {
            acc.price = Math.min(perNightCap, 2000); // Default to budget cap or 2000, whichever is lower
          }
          // Allow accommodations up to 1.5x the budget cap
          return acc.price <= perNightCap * 1.5;
        });
        const afterFilter = accommodations.length;
        if (beforeFilter !== afterFilter) {
          console.log(`Filtered ${beforeFilter - afterFilter} accommodations due to budget constraints`);
        }
      }
      
      if (accommodations.length > 0) {
        const dataSource = accommodations[0]?.source || response.source || response.meta?.source || 'unknown';
        console.log(`✅ Loaded ${accommodations.length} accommodations from ${dataSource}`);
        console.log('Response metadata:', { source: response.source, meta: response.meta });
        console.log('Sample accommodations:', accommodations.slice(0, 3).map(a => ({ 
          name: a.name, 
          price: a.price, 
          source: a.source,
          image: a.image ? 'has image' : 'no image'
        })));
        setAccommodations(accommodations);
        return;
      }
      
      // Log response structure for debugging if no accommodations found
      if (accommodations.length === 0) {
        console.warn('⚠️ No accommodations found after processing response');
        if (Array.isArray(response)) {
          console.warn(`Response is array with ${response.length} items`);
        } else {
          console.warn('Response structure:', {
            keys: Object.keys(response),
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : [],
            hasHotels: !!response.hotels,
            hotelsLength: response.hotels?.length || 0,
            hasAccommodations: !!response.accommodations,
            accommodationsLength: response.accommodations?.length || 0
          });
        }
      }

      // If nothing came back (or mock results), try again without server-side price cap
      const isMockSource = response && response.source === 'mock';
      if (accommodations.length === 0 || isMockSource) {
        try {
          const relaxedResponse = await fetchHotels({
            destination: tripDetails.destination,
            checkin,
            checkout,
            adults: groupSize,
            rooms
          });

          let relaxedList = [];
          if (relaxedResponse?.hotels && Array.isArray(relaxedResponse.hotels)) {
            relaxedList = relaxedResponse.hotels.map(hotel => ({
              id: hotel.id || hotel.hotel_id,
              name: hotel.name || hotel.hotel_name || 'Hotel',
              price: hotel.price || hotel.min_total_price || 0,
              rating: hotel.rating || hotel.review_score || 0,
              image: hotel.image || hotel.imageUrl || hotel.max_photo_url || hotel.main_photo_url || '',
              location: hotel.location || hotel.address || hotel.city_trans || tripDetails.destination,
              amenities: hotel.amenities || [],
              type: hotel.type || 'Hotel',
              description: hotel.description || `${hotel.name || 'Hotel'} in ${tripDetails.destination}`,
              address: hotel.address || hotel.location || tripDetails.destination,
              coordinates: hotel.coordinates || [],
              reviews: hotel.reviews || hotel.review_nr || 0,
              source: 'booking_com'
            }));
          }

          // Apply client-side cap based on budget
          relaxedList = relaxedList.filter(h => !h.price || h.price <= perNightCap * 1.25);

          if (relaxedList.length > 0) {
            accommodations = relaxedList;
          }
        } catch (_) {
          // ignore and fall back to mock only if all APIs fail
        }
      }

      // Only use mock data as last resort if all APIs fail
      if (accommodations.length === 0) {
        console.log('All APIs failed, using minimal fallback data');
        const base = [
          { id: 1, name: `${tripDetails.destination} City Inn`, price: 1200, rating: 4.2, image: '', location: tripDetails.destination, amenities: ['Free WiFi','Parking'], type: 'Hotel', description: `Comfortable hotel in ${tripDetails.destination}`, address: tripDetails.destination, coordinates: [], source: 'fallback' },
          { id: 2, name: `${tripDetails.destination} Comfort Stay`, price: 1800, rating: 4.4, image: '', location: tripDetails.destination, amenities: ['Free WiFi','Breakfast'], type: 'Hotel', description: `Well-rated hotel in ${tripDetails.destination}`, address: tripDetails.destination, coordinates: [], source: 'fallback' },
          { id: 3, name: `${tripDetails.destination} Budget Lodge`, price: 800, rating: 3.9, image: '', location: tripDetails.destination, amenities: ['Free WiFi'], type: 'Hostel', description: `Budget-friendly accommodation in ${tripDetails.destination}`, address: tripDetails.destination, coordinates: [], source: 'fallback' }
        ];
        accommodations = base.filter(h => !h.price || h.price <= perNightCap * 1.25);
      }

      setAccommodations(accommodations);
    } catch (error) {
      console.error('Error loading accommodations:', error);
      const errorMessage = error.message || 'Failed to load accommodations';
      setError(errorMessage);
      
      // Only show fallback data if it's a network error, not an API error
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('timeout')) {
        console.log('Network error detected, using fallback accommodations');
        const fallbackAccommodations = [
          { id: 1, name: `${tripDetails.destination} City Inn`, price: 1200, rating: 4.2, image: '', location: tripDetails.destination, amenities: ['Free WiFi','Parking'], type: 'Hotel', description: `Comfortable hotel in ${tripDetails.destination}`, address: tripDetails.destination, source: 'fallback' },
          { id: 2, name: `${tripDetails.destination} Comfort Stay`, price: 1800, rating: 4.4, image: '', location: tripDetails.destination, amenities: ['Free WiFi','Breakfast'], type: 'Hotel', description: `Well-rated hotel in ${tripDetails.destination}`, address: tripDetails.destination, source: 'fallback' },
          { id: 3, name: `${tripDetails.destination} Budget Lodge`, price: 800, rating: 3.9, image: '', location: tripDetails.destination, amenities: ['Free WiFi'], type: 'Hostel', description: `Budget-friendly accommodation in ${tripDetails.destination}`, address: tripDetails.destination, source: 'fallback' }
        ];
        setAccommodations(fallbackAccommodations);
      } else {
        // API error - show empty state instead of fallback
        console.log('API error, showing empty state');
        setAccommodations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Removed mock generators; real API data is used

  const filteredAccommodations = accommodations.filter(acc => {
    if (filters.type !== 'all' && acc.type.toLowerCase() !== filters.type.toLowerCase()) {
      return false;
    }
    
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (acc.price < min || acc.price > max) {
        return false;
      }
    }
    
    if (filters.rating > 0 && acc.rating < filters.rating) {
      return false;
    }
    
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => 
        acc.amenities.some(accAmenity => 
          accAmenity.toLowerCase().includes(amenity.toLowerCase())
        )
      );
      if (!hasAllAmenities) return false;
    }
    
    return true;
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const getAccommodationTypeIcon = (type) => {
    const icons = {
      'Hostel': '🏠',
      'Guest House': '🏡',
      'Hotel': '🏨',
      'Resort': '🏖️',
      'Apartment': '🏢'
    };
    return icons[type] || '🏨';
  };

  const getPriceRangeLabel = (price) => {
    if (price < 1000) return 'Budget';
    if (price < 2500) return 'Mid-range';
    return 'Luxury';
  };

  if (loading) {
    return (
      <div className="travel-section">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[hsla(var(--misty-foam)/0.8)] rounded-full w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-[hsla(var(--misty-foam)/0.65)] rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="travel-section space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-earth">
            Accommodation Recommendations
          </h3>
          <p className="travel-subtle-text text-sm">
            Tailored stays that match your pace, comfort, and budget.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="travel-pill text-sm">
            {filteredAccommodations.length} options
          </span>
          {selectedAccommodations.length > 0 && (
            <span className="travel-pill text-sm bg-sunset-soft text-earth">
              {selectedAccommodations.length} saved
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="travel-note border border-[hsla(var(--destructive)/0.35)] bg-[hsla(var(--destructive)/0.18)] text-[hsl(var(--earth-brown))]">
          <div className="flex items-start gap-2">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div className="space-y-2">
            <label className="travel-label">Accommodation type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="travel-input w-full px-4 py-3"
            >
              <option value="all">All Types</option>
              <option value="hostel">Hostel</option>
              <option value="guest house">Guest House</option>
              <option value="hotel">Hotel</option>
              <option value="resort">Resort</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="travel-label">Price comfort</label>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="travel-input w-full px-4 py-3"
            >
              <option value="all">All budgets</option>
              <option value="0-1000">Under ₹1,000</option>
              <option value="1000-2500">₹1,000 - ₹2,500</option>
              <option value="2500-5000">₹2,500 - ₹5,000</option>
              <option value="5000-9999">Above ₹5,000</option>
            </select>
          </div>

  {/* Rating Filter */}
          <div className="space-y-2">
            <label className="travel-label">Minimum rating</label>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
              className="travel-input w-full px-4 py-3"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* Amenities Filter */}
        <div className="space-y-2">
          <label className="travel-label">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {['Free WiFi', 'Parking', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Breakfast'].map(amenity => (
              <button
                key={amenity}
                onClick={() => handleAmenityToggle(amenity)}
                className={`travel-interest text-sm ${filters.amenities.includes(amenity) ? 'travel-interest-active' : ''}`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accommodations List */}
      <div className="space-y-4">
        {filteredAccommodations.map(accommodation => {
          const isSelected = selectedAccommodations.some(acc => acc.id === accommodation.id);
          const tripDuration = calculateTripDuration() || 1;
          const totalPrice = (accommodation.price || 0) * tripDuration;
          
          return (
          <div 
            key={accommodation.id} 
            className={`glass-card p-4 sm:p-5 transition-transform ${isSelected ? 'soft-shadow ring-2 ring-[hsla(var(--accent)/0.4)]' : 'hover:soft-shadow hover:-translate-y-1'}`}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl soft-shadow">
                <img
                  src={accommodation.image || 'https://via.placeholder.com/150?text=Hotel'}
                  alt={accommodation.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=Hotel';
                  }}
                />
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-earth flex items-center gap-2">
                      {accommodation.name}
                      <span className="travel-pill text-xs">
                        {getAccommodationTypeIcon(accommodation.type)} {accommodation.type}
                      </span>
                    </h4>
                    <div className="travel-subtle-text text-sm flex flex-wrap gap-2">
                      <span>{accommodation.location}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        {accommodation.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-earth">
                      ₹{(accommodation.price || 0).toLocaleString()}
                    </div>
                    <div className="travel-subtle-text text-sm">per night</div>
                    {tripDuration > 1 && (
                      <div className="travel-subtle-text text-xs mt-1">
                        Total: ₹{totalPrice.toLocaleString()} ({tripDuration} nights)
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="travel-body-text text-sm leading-relaxed">
                  {accommodation.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {accommodation.amenities.map(amenity => (
                    <span
                      key={amenity}
                      className="travel-pill text-xs bg-sunset-soft text-earth"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="travel-pill text-xs bg-warm-sky-soft text-earth">
                    {getPriceRangeLabel(accommodation.price)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAccommodation(accommodation);
                        setIsModalOpen(true);
                      }}
                      className="travel-pill text-sm bg-misty text-earth hover:opacity-85 transition-opacity duration-200"
                    >
                      View Details
                    </button>
                    {isSelected ? (
                      <button 
                        onClick={() => removeAccommodation(accommodation.id)}
                        className="travel-pill text-sm bg-sunset-soft text-earth hover:opacity-85 transition-opacity duration-200"
                      >
                        ✓ Selected
                      </button>
                    ) : (
                      <button 
                        onClick={() => addAccommodation(accommodation)}
                        className="travel-button px-6 py-2 text-sm font-medium"
                      >
                        Save stay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {filteredAccommodations.length === 0 && (
        <EmptyState
          icon="🏨"
          title="No accommodations found"
          description="Try adjusting your filters to see more welcoming stays."
        />
      )}

      {/* Detail Modal */}
      <AccommodationDetailModal
        accommodation={selectedAccommodation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={addAccommodation}
        onRemove={removeAccommodation}
        isSelected={selectedAccommodation ? selectedAccommodations.some(acc => acc.id === selectedAccommodation.id) : false}
      />
    </div>
  );
};

export default AccommodationRecommendations;
