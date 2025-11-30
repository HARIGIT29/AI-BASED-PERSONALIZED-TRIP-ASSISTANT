import axios from 'axios';
import { sendSuccess, sendError, formatResponse } from '../utils/responseHelper.js';

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

const parseNumber = (v, fb) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};

export const searchAttractions = async (req, res) => {
  try {
    const {
      destination = '',
      lat,
      lng,
      radius = '10000',
      minRating = '4',
      maxResults = '20',
      page = '1',
      limit = '20'
    } = req.query;

    // Pagination support
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || parseInt(maxResults) || 20));
    const skip = (pageNum - 1) * limitNum;

    console.log('Attractions search request:', { destination, lat, lng, radius, minRating, maxResults });

    // Use Google Places API
    const googleKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    console.log('Google Places API Key:', googleKey ? 'Present' : 'Missing');
    if (!googleKey) {
      console.warn('Google Maps API key not configured, using fallback attractions data');
      
      // Fallback to mock attractions data with destination-specific attractions
      const destinationAttractions = {
        'mumbai': [
          { id: 1, name: 'Gateway of India', rating: 4.5, price: 0, duration: '1-2 hours', description: 'Iconic monument and historic gateway', coordinates: [18.9220, 72.8347], category: 'monument', facilities: ['Photography', 'Boat Rides'] },
          { id: 2, name: 'Marine Drive', rating: 4.3, price: 0, duration: '2-3 hours', description: 'Famous promenade along the Arabian Sea', coordinates: [18.9445, 72.8238], category: 'scenic', facilities: ['Walking', 'Photography'] },
          { id: 3, name: 'Elephanta Caves', rating: 4.4, price: 250, duration: '3-4 hours', description: 'Ancient rock-cut caves with Hindu sculptures', coordinates: [18.9585, 72.9308], category: 'heritage', facilities: ['Boat Transport', 'Guided Tours'] }
        ],
        'delhi': [
          { id: 1, name: 'Red Fort', rating: 4.6, price: 50, duration: '2-3 hours', description: 'Historic fort and UNESCO World Heritage Site', coordinates: [28.6562, 77.2410], category: 'heritage', facilities: ['Audio Guide', 'Museum'] },
          { id: 2, name: 'India Gate', rating: 4.4, price: 0, duration: '1-2 hours', description: 'War memorial and national monument', coordinates: [28.6129, 77.2295], category: 'monument', facilities: ['Photography', 'Walking'] },
          { id: 3, name: 'Qutub Minar', rating: 4.5, price: 40, duration: '2-3 hours', description: 'Tallest brick minaret in the world', coordinates: [28.5244, 77.1855], category: 'heritage', facilities: ['Photography', 'Guided Tours'] }
        ],
        'goa': [
          { id: 1, name: 'Calangute Beach', rating: 4.2, price: 0, duration: 'Full day', description: 'Popular beach destination with water sports', coordinates: [15.5385, 73.7553], category: 'beach', facilities: ['Water Sports', 'Beach Shacks'] },
          { id: 2, name: 'Old Goa Churches', rating: 4.6, price: 0, duration: '2-3 hours', description: 'UNESCO World Heritage churches', coordinates: [15.4986, 73.9108], category: 'heritage', facilities: ['Photography', 'Guided Tours'] },
          { id: 3, name: 'Dudhsagar Falls', rating: 4.7, price: 100, duration: '4-5 hours', description: 'Magnificent four-tiered waterfall', coordinates: [15.3144, 74.3150], category: 'nature', facilities: ['Trekking', 'Photography'] }
        ]
      };

      const mockAttractions = destinationAttractions[destination.toLowerCase()] || [
        {
          id: 1,
          name: `${destination} Tourist Spot`,
          rating: 4.2,
          price: 0,
          duration: '2-3 hours',
          description: `A popular tourist destination in ${destination}`,
          coordinates: [28.6139, 77.2090],
          imageUrl: '',
          category: 'attraction',
          facilities: ['Parking', 'Restrooms', 'Guided Tours']
        },
        {
          id: 2,
          name: `${destination} Heritage Site`,
          rating: 4.5,
          price: 100,
          duration: '1-2 hours',
          description: `Historical and cultural significance in ${destination}`,
          coordinates: [28.6139, 77.2090],
          imageUrl: '',
          category: 'heritage',
          facilities: ['Audio Guide', 'Museum', 'Gift Shop']
        }
      ];
      
      return res.json({ attractions: mockAttractions, source: 'fallback' });
    }

    const paramsCommon = {
      key: googleKey,
      language: 'en',
      region: 'in'
    };

    let location = null;
    if (lat && lng) {
      location = `${lat},${lng}`;
    } else if (destination) {
      // Geocode destination to get lat/lng using Places textsearch
      const textParams = { ...paramsCommon, query: `${destination}, India` };
      const textUrl = `${PLACES_BASE}/textsearch/json`;
      const { data: textData } = await axios.get(textUrl, { params: textParams, timeout: 10000 });
      const first = textData?.results?.[0];
      if (first?.geometry?.location) {
        location = `${first.geometry.location.lat},${first.geometry.location.lng}`;
      }
    }

    if (!location) {
      return sendSuccess(res, [], {
        source: 'google_places',
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0
      });
    }

    // Nearby search for tourist attractions in India region
    const nearbyParams = {
      ...paramsCommon,
      location,
      radius: parseNumber(radius, 10000),
      type: 'tourist_attraction',
      keyword: 'india'
    };
    const nearbyUrl = `${PLACES_BASE}/nearbysearch/json`;
    const { data } = await axios.get(nearbyUrl, { params: nearbyParams, timeout: 15000 });

    const minR = parseNumber(minRating, 0);

    const results = Array.isArray(data?.results) ? data.results : [];
    const attractions = results
      .filter(p => (p.rating || 0) >= minR)
      .map((p, idx) => ({
        id: p.place_id || idx,
        name: p.name,
        rating: p.rating || 0,
        price: 0,
        duration: '1-2 hours',
        description: p.vicinity || p.formatted_address || '',
        coordinates: [p.geometry?.location?.lat, p.geometry?.location?.lng],
        imageUrl: p.photos?.[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photos[0].photo_reference}&key=${googleKey}` : '',
        category: 'attraction',
        facilities: []
      }));

    if (attractions.length > 0) {
      // Apply pagination
      const paginatedAttractions = attractions.slice(skip, skip + limitNum);
      return sendSuccess(res, paginatedAttractions, {
        source: 'google_places',
        total: attractions.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(attractions.length / limitNum)
      });
    } else {
      // No attractions found from Google Places, use fallback
      console.log('Google Places returned no attractions, using fallback data');
      const destinationAttractions = {
        'mumbai': [
          { id: 1, name: 'Gateway of India', rating: 4.5, price: 0, duration: '1-2 hours', description: 'Iconic monument and historic gateway', coordinates: [18.9220, 72.8347], category: 'monument', facilities: ['Photography', 'Boat Rides'] },
          { id: 2, name: 'Marine Drive', rating: 4.3, price: 0, duration: '2-3 hours', description: 'Famous promenade along the Arabian Sea', coordinates: [18.9445, 72.8238], category: 'scenic', facilities: ['Walking', 'Photography'] },
          { id: 3, name: 'Elephanta Caves', rating: 4.4, price: 250, duration: '3-4 hours', description: 'Ancient rock-cut caves with Hindu sculptures', coordinates: [18.9585, 72.9308], category: 'heritage', facilities: ['Boat Transport', 'Guided Tours'] }
        ],
        'delhi': [
          { id: 1, name: 'Red Fort', rating: 4.6, price: 50, duration: '2-3 hours', description: 'Historic fort and UNESCO World Heritage Site', coordinates: [28.6562, 77.2410], category: 'heritage', facilities: ['Audio Guide', 'Museum'] },
          { id: 2, name: 'India Gate', rating: 4.4, price: 0, duration: '1-2 hours', description: 'War memorial and national monument', coordinates: [28.6129, 77.2295], category: 'monument', facilities: ['Photography', 'Walking'] },
          { id: 3, name: 'Qutub Minar', rating: 4.5, price: 40, duration: '2-3 hours', description: 'Tallest brick minaret in the world', coordinates: [28.5244, 77.1855], category: 'heritage', facilities: ['Photography', 'Guided Tours'] }
        ],
        'goa': [
          { id: 1, name: 'Calangute Beach', rating: 4.2, price: 0, duration: 'Full day', description: 'Popular beach destination with water sports', coordinates: [15.5385, 73.7553], category: 'beach', facilities: ['Water Sports', 'Beach Shacks'] },
          { id: 2, name: 'Old Goa Churches', rating: 4.6, price: 0, duration: '2-3 hours', description: 'UNESCO World Heritage churches', coordinates: [15.4986, 73.9108], category: 'heritage', facilities: ['Photography', 'Guided Tours'] },
          { id: 3, name: 'Dudhsagar Falls', rating: 4.7, price: 100, duration: '4-5 hours', description: 'Magnificent four-tiered waterfall', coordinates: [15.3144, 74.3150], category: 'nature', facilities: ['Trekking', 'Photography'] }
        ]
      };

      const mockAttractions = destinationAttractions[destination.toLowerCase()] || [
        {
          id: 1,
          name: `${destination} Tourist Spot`,
          rating: 4.2,
          price: 0,
          duration: '2-3 hours',
          description: `A popular tourist destination in ${destination}`,
          coordinates: [28.6139, 77.2090],
          imageUrl: '',
          category: 'attraction',
          facilities: ['Parking', 'Restrooms', 'Guided Tours']
        },
        {
          id: 2,
          name: `${destination} Heritage Site`,
          rating: 4.5,
          price: 100,
          duration: '1-2 hours',
          description: `Historical and cultural significance in ${destination}`,
          coordinates: [28.6139, 77.2090],
          imageUrl: '',
          category: 'heritage',
          facilities: ['Audio Guide', 'Museum', 'Gift Shop']
        }
      ];
      
      const pageNum = Math.max(1, parseInt(req.query?.page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(req.query?.limit) || parseInt(req.query?.maxResults) || 20));
      const skip = (pageNum - 1) * limitNum;
      const paginatedMock = mockAttractions.slice(skip, skip + limitNum);
      
      return sendSuccess(res, paginatedMock, {
        source: 'fallback',
        total: mockAttractions.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(mockAttractions.length / limitNum)
      });
    }
  } catch (err) {
    // Final fallback to mock data if everything fails
    console.log('All APIs failed, using final fallback data');
    
    const destinationAttractions = {
      'mumbai': [
        { id: 1, name: 'Gateway of India', rating: 4.5, price: 0, duration: '1-2 hours', description: 'Iconic monument and historic gateway', coordinates: [18.9220, 72.8347], category: 'monument', facilities: ['Photography', 'Boat Rides'] },
        { id: 2, name: 'Marine Drive', rating: 4.3, price: 0, duration: '2-3 hours', description: 'Famous promenade along the Arabian Sea', coordinates: [18.9445, 72.8238], category: 'scenic', facilities: ['Walking', 'Photography'] },
        { id: 3, name: 'Elephanta Caves', rating: 4.4, price: 250, duration: '3-4 hours', description: 'Ancient rock-cut caves with Hindu sculptures', coordinates: [18.9585, 72.9308], category: 'heritage', facilities: ['Boat Transport', 'Guided Tours'] }
      ],
      'delhi': [
        { id: 1, name: 'Red Fort', rating: 4.6, price: 50, duration: '2-3 hours', description: 'Historic fort and UNESCO World Heritage Site', coordinates: [28.6562, 77.2410], category: 'heritage', facilities: ['Audio Guide', 'Museum'] },
        { id: 2, name: 'India Gate', rating: 4.4, price: 0, duration: '1-2 hours', description: 'War memorial and national monument', coordinates: [28.6129, 77.2295], category: 'monument', facilities: ['Photography', 'Walking'] },
        { id: 3, name: 'Qutub Minar', rating: 4.5, price: 40, duration: '2-3 hours', description: 'Tallest brick minaret in the world', coordinates: [28.5244, 77.1855], category: 'heritage', facilities: ['Photography', 'Guided Tours'] }
      ],
      'goa': [
        { id: 1, name: 'Calangute Beach', rating: 4.2, price: 0, duration: 'Full day', description: 'Popular beach destination with water sports', coordinates: [15.5385, 73.7553], category: 'beach', facilities: ['Water Sports', 'Beach Shacks'] },
        { id: 2, name: 'Old Goa Churches', rating: 4.6, price: 0, duration: '2-3 hours', description: 'UNESCO World Heritage churches', coordinates: [15.4986, 73.9108], category: 'heritage', facilities: ['Photography', 'Guided Tours'] },
        { id: 3, name: 'Dudhsagar Falls', rating: 4.7, price: 100, duration: '4-5 hours', description: 'Magnificent four-tiered waterfall', coordinates: [15.3144, 74.3150], category: 'nature', facilities: ['Trekking', 'Photography'] }
      ]
    };

    const rawDestination = (req.query && typeof req.query.destination === 'string')
      ? req.query.destination
      : '';
    const safeDestination = rawDestination.trim().length > 0 ? rawDestination : 'Your Destination';
    const key = safeDestination.toLowerCase();
    const mockAttractions = destinationAttractions[key] || [
      {
        id: 1,
        name: `${safeDestination} Tourist Spot`,
        rating: 4.2,
        price: 0,
        duration: '2-3 hours',
        description: `A popular tourist destination in ${safeDestination}`,
        coordinates: [28.6139, 77.2090],
        imageUrl: '',
        category: 'attraction',
        facilities: ['Parking', 'Restrooms', 'Guided Tours']
      },
      {
        id: 2,
        name: `${safeDestination} Heritage Site`,
        rating: 4.5,
        price: 100,
        duration: '1-2 hours',
        description: `Historical and cultural significance in ${safeDestination}`,
        coordinates: [28.6139, 77.2090],
        imageUrl: '',
        category: 'heritage',
        facilities: ['Audio Guide', 'Museum', 'Gift Shop']
      }
    ];
    
    // This code is already handled in the catch block above
    console.error('Error searching attractions:', err);
    sendError(res, 'Failed to search attractions', 'SEARCH_ERROR', err.message, 500);
  }
};


