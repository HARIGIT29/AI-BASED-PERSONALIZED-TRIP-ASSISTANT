import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { attractionsData, getAttractionLocation, getNearbyAttractions } from '../data/attractionsData';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const AttractionsMap = ({ selectedCity, selectedAttraction, onAttractionSelect }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (selectedAttraction) {
      const nearby = getNearbyAttractions(selectedAttraction, 2);
      setNearbyAttractions(nearby);
    }
  }, [selectedAttraction]);

  const onLoad = (map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  const handleMarkerClick = (attraction) => {
    setSelectedMarker(attraction);
    onAttractionSelect?.(attraction);
  };

  const getAttractionsForMap = () => {
    if (selectedCity) {
      return attractionsData[selectedCity]?.attractions || [];
    }
    return Object.values(attractionsData).flatMap(city => city.attractions);
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyBR7U052XVfS2P4sdB4EF18NBrGii0LTVk"}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedAttraction ? getAttractionLocation(selectedAttraction) : defaultCenter}
        zoom={selectedCity ? 12 : 5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        {getAttractionsForMap().map((attraction) => (
          <Marker
            key={attraction.id}
            position={getAttractionLocation(attraction)}
            onClick={() => handleMarkerClick(attraction)}
            icon={{
              url: getMarkerIcon(attraction.category),
              scaledSize: new window.google.maps.Size(30, 30)
            }}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={getAttractionLocation(selectedMarker)}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <h3 className="font-bold">{selectedMarker.name}</h3>
              <p className="text-sm">{selectedMarker.description}</p>
              <div className="mt-2">
                <a
                  href={selectedMarker.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </InfoWindow>
        )}

        {nearbyAttractions.map((attraction) => (
          <Marker
            key={`nearby-${attraction.id}`}
            position={getAttractionLocation(attraction)}
            icon={{
              url: getMarkerIcon(attraction.category, true),
              scaledSize: new window.google.maps.Size(25, 25)
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

const getMarkerIcon = (category, isNearby = false) => {
  const baseUrl = "https://maps.google.com/mapfiles/ms/icons/";
  const colors = {
    monuments: "red",
    nature: "green",
    religious: "blue",
    heritage: "purple",
    wildlife: "orange",
    museums: "yellow",
    shopping: "pink",
    nightlife: "black",
    food: "brown",
    festivals: "cyan"
  };
  return `${baseUrl}${colors[category] || "red"}-dot${isNearby ? "-small" : ""}.png`;
};

export default AttractionsMap; 