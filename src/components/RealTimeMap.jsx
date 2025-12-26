import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AddressAutofill } from '@mapbox/search-js-react';

// Replace with YOUR actual Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoidmFpc2huYXZpc29tdSIsImEiOiJjbWptbGl0NTQyZ2NoM2RzNXdvbmx6a2xlIn0.b67HA0d0F9ltj7wXflLjjQ';
mapboxgl.accessToken = MAPBOX_TOKEN;

const RealTimeMap = ({ onLocationSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [viewport, setViewport] = useState({
    longitude: 78.4867,
    latitude: 17.3850,
    zoom: 11
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
      interactive: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true
      }),
      'top-right'
    );

    // Map load event
    map.current.on('load', () => {
      setIsMapLoaded(true);
      console.log('Map loaded successfully!');
    });

    // Handle map clicks
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      addMarker(lng, lat);
      reverseGeocode(lng, lat);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add/Update Marker
  const addMarker = (lng, lat) => {
    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create new marker
    marker.current = new mapboxgl.Marker({
      color: '#FF0000',
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Update on drag end
    marker.current.on('dragend', () => {
      const lngLat = marker.current.getLngLat();
      reverseGeocode(lngLat.lng, lngLat.lat);
    });
  };

  // Reverse Geocoding: Get address from coordinates
  const reverseGeocode = async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi,place`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        setSearchInput(address);
        
        const locationData = {
          latitude: lat,
          longitude: lng,
          address: address
        };
        
        setSelectedLocation(locationData);
        if (onLocationSelect) {
          onLocationSelect(locationData);
        }
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  // Handle Search
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchInput.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${MAPBOX_TOKEN}&country=in&bbox=78.2,17.2,78.7,17.6&limit=5`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const firstResult = data.features[0];
        const [lng, lat] = firstResult.center;
        
        // Fly to location
        map.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true
        });
        
        // Add marker
        addMarker(lng, lat);
        
        // Set location data
        const locationData = {
          latitude: lat,
          longitude: lng,
          address: firstResult.place_name
        };
        
        setSelectedLocation(locationData);
        if (onLocationSelect) {
          onLocationSelect(locationData);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Use Current Location
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15
          });
          
          addMarker(longitude, latitude);
          reverseGeocode(longitude, latitude);
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.');
        }
      );
    }
  };

  // Popular Hyderabad Locations
  const hyderabadHotspots = [
    { name: 'HITEC City', lng: 78.3816, lat: 17.4419 },
    { name: 'Gachibowli', lng: 78.3480, lat: 17.4400 },
    { name: 'Madhapur', lng: 78.3915, lat: 17.4484 },
    { name: 'Kondapur', lng: 78.3636, lat: 17.4750 },
    { name: 'Banjara Hills', lng: 78.4345, lat: 17.4126 },
    { name: 'Secunderabad', lng: 78.5000, lat: 17.4399 },
    { name: 'Charminar', lng: 78.4747, lat: 17.3616 },
    { name: 'Kukatpally', lng: 78.4134, lat: 17.4849 }
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Search Bar with Autocomplete */}
      <div style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <AddressAutofill
              accessToken={MAPBOX_TOKEN}
              onRetrieve={(result) => {
                const [lng, lat] = result.features[0].geometry.coordinates;
                map.current.flyTo({
                  center: [lng, lat],
                  zoom: 15
                });
                addMarker(lng, lat);
                
                const locationData = {
                  latitude: lat,
                  longitude: lng,
                  address: result.features[0].properties.full_address
                };
                
                setSelectedLocation(locationData);
                if (onLocationSelect) {
                  onLocationSelect(locationData);
                }
              }}
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for location in Hyderabad..."
                autoComplete="address-line1"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </AddressAutofill>
            <div style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666',
              fontSize: '12px'
            }}>
              ⬇️ Type for suggestions
            </div>
          </div>
          
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Search
          </button>
          
          <button
            type="button"
            onClick={useCurrentLocation}
            style={{
              padding: '12px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            📍 My Location
          </button>
        </form>

        {/* Quick Location Buttons */}
        <div style={{ marginTop: '15px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Quick select Hyderabad locations:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {hyderabadHotspots.map((spot, index) => (
              <button
                key={index}
                onClick={() => {
                  map.current.flyTo({
                    center: [spot.lng, spot.lat],
                    zoom: 14
                  });
                  addMarker(spot.lng, spot.lat);
                  setSearchInput(spot.name + ', Hyderabad');
                  
                  const locationData = {
                    latitude: spot.lat,
                    longitude: spot.lng,
                    address: spot.name + ', Hyderabad'
                  };
                  
                  setSelectedLocation(locationData);
                  if (onLocationSelect) {
                    onLocationSelect(locationData);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f7ff',
                  border: '1px solid #1976d2',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#1976d2'
                }}
              >
                {spot.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          height: '450px',
          width: '100%',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '2px solid #e0e0e0',
          position: 'relative'
        }}
      >
        {/* Loading Overlay */}
        {!isMapLoaded && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🗺️</div>
            <div>Loading Hyderabad map...</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Using Mapbox real-time mapping
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
              fontSize: '12px'
            }}>
              ✓
            </div>
            <strong>Location Selected</strong>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Address</div>
              <div style={{ fontSize: '14px' }}>{selectedLocation.address}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Coordinates</div>
              <div style={{ fontSize: '14px' }}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '10px',
            fontSize: '12px',
            color: '#666',
            padding: '8px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px'
          }}>
            ✅ Location is ready for grievance submission
          </div>
        </div>
      )}

      {/* Map Instructions */}
      <div style={{
        marginTop: '15px',
        padding: '12px',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ marginRight: '8px' }}>💡</div>
          <strong>How to use this map:</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <div>1. Type address for autocomplete</div>
          <div>2. Click quick location buttons</div>
          <div>3. Click directly on the map</div>
          <div>4. Drag red marker to adjust</div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMap;