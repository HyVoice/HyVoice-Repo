// src/components/Map.jsx - SIMPLER VERSION
import React, { useState, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'; // Public token for testing

const SimpleMap = ({ onLocationSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(78.4867);
  const [lat, setLat] = useState(17.3850);
  const [zoom, setZoom] = useState(12);
  const [marker, setMarker] = useState(null);

  // Initialize map
  React.useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle map clicks
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setLng(lng);
      setLat(lat);
      
      // Remove existing marker
      if (marker) marker.remove();
      
      // Add new marker
      const newMarker = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([lng, lat])
        .addTo(map.current);
      
      setMarker(newMarker);
      
      // Callback to parent
      if (onLocationSelect) {
        onLocationSelect({ latitude: lat, longitude: lng });
      }
    });

    // Update state on move
    map.current.on('move', () => {
      if (!map.current) return;
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

  }, []); // eslint-disable-line

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div 
        ref={mapContainer} 
        style={{ 
          height: '500px', 
          width: '100%',
          borderRadius: '10px',
          overflow: 'hidden'
        }} 
      />
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        💡 Click anywhere on the map to select location for grievance
      </div>
    </div>
  );
};

export default SimpleMap;