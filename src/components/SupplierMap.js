'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Filter, Globe } from 'lucide-react';

const SupplierMap = ({ suppliers, userLocation }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [filterDistance, setFilterDistance] = useState(1000); // km
  const [showUserLocation, setShowUserLocation] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = initializeMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    if (typeof L === 'undefined') return;

    const mapInstance = L.map(mapRef.current).setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    setMap(mapInstance);
  };

  useEffect(() => {
    if (!map || !suppliers.length) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    const newMarkers = [];

    suppliers.forEach(supplier => {
      if (supplier.latitude && supplier.longitude && 
          !isNaN(supplier.latitude) && !isNaN(supplier.longitude) &&
          supplier.latitude >= -90 && supplier.latitude <= 90 &&
          supplier.longitude >= -180 && supplier.longitude <= 180) {
        
        const marker = L.marker([supplier.latitude, supplier.longitude])
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-lg">${supplier.companyName}</h3>
              <p class="text-sm text-gray-600">${supplier.companyType || 'Unknown Type'}</p>
              <p class="text-sm">${supplier.headquartersCity}, ${supplier.headquartersCountry}</p>
              ${supplier.revenue ? `<p class="text-sm font-medium">Revenue: ${formatCurrency(supplier.revenue)}</p>` : ''}
              ${supplier.website ? `<a href="${supplier.website}" target="_blank" class="text-blue-600 hover:underline text-sm">Visit Website</a>` : ''}
            </div>
          `);
        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    // Fit map to show all markers only if we have valid markers
    if (newMarkers.length > 0) {
      try {
        const group = L.featureGroup(newMarkers);
        const bounds = group.getBounds();
        
        // Check if bounds are valid
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        } else {
          // Fallback to default view if bounds are invalid
          map.setView([20, 0], 2);
        }
      } catch (error) {
        console.warn('Error fitting map bounds:', error);
        // Fallback to default view
        map.setView([20, 0], 2);
      }
    } else {
      // If no valid markers, set default view
      map.setView([20, 0], 2);
    }
  }, [map, suppliers]);

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    if (typeof amount === 'string') return amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filterSuppliersByDistance = () => {
    if (!userLocation || !map) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    const newMarkers = [];

    suppliers.forEach(supplier => {
      if (supplier.latitude && supplier.longitude && 
          !isNaN(supplier.latitude) && !isNaN(supplier.longitude) &&
          supplier.latitude >= -90 && supplier.latitude <= 90 &&
          supplier.longitude >= -180 && supplier.longitude <= 180) {
        
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          supplier.latitude,
          supplier.longitude
        );

        if (distance <= filterDistance) {
          const marker = L.marker([supplier.latitude, supplier.longitude])
            .addTo(map)
            .bindPopup(`
              <div class="p-2">
                <h3 class="font-semibold text-lg">${supplier.companyName}</h3>
                <p class="text-sm text-gray-600">${supplier.companyType || 'Unknown Type'}</p>
                <p class="text-sm">${supplier.headquartersCity}, ${supplier.headquartersCountry}</p>
                <p class="text-sm font-medium">Distance: ${distance.toFixed(1)} km</p>
                ${supplier.revenue ? `<p class="text-sm font-medium">Revenue: ${formatCurrency(supplier.revenue)}</p>` : ''}
                ${supplier.website ? `<a href="${supplier.website}" target="_blank" class="text-blue-600 hover:underline text-sm">Visit Website</a>` : ''}
              </div>
            `);
          newMarkers.push(marker);
        }
      }
    });

    setMarkers(newMarkers);

    // Add user location marker
    if (showUserLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>',
          iconSize: [16, 16]
        })
      }).addTo(map).bindPopup('Your Location');
      newMarkers.push(userMarker);
    }

    // Fit bounds for filtered markers
    if (newMarkers.length > 0) {
      try {
        const group = L.featureGroup(newMarkers);
        const bounds = group.getBounds();
        
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        } else {
          map.setView([20, 0], 2);
        }
      } catch (error) {
        console.warn('Error fitting filtered map bounds:', error);
        map.setView([20, 0], 2);
      }
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const suppliersWithLocation = suppliers.filter(s => 
    s.latitude && s.longitude && 
    !isNaN(s.latitude) && !isNaN(s.longitude) &&
    s.latitude >= -90 && s.latitude <= 90 &&
    s.longitude >= -180 && s.longitude <= 180
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Geographic Distribution</h2>
        <p className="text-gray-600">
          {suppliersWithLocation.length} suppliers with location data
        </p>
      </div>

      {/* Map Controls */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        {userLocation && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Filter by distance:</span>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={filterDistance}
                onChange={(e) => setFilterDistance(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-600">{filterDistance} km</span>
            </div>
            <button
              onClick={filterSuppliersByDistance}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Apply Filter
            </button>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showUserLocation}
                onChange={(e) => setShowUserLocation(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Show my location</span>
            </label>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-200"
        style={{ minHeight: '400px' }}
      />

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Geographic Coverage</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {new Set(suppliers.map(s => s.headquartersCountry).filter(Boolean)).size} countries
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Suppliers with Location</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {suppliersWithLocation.length} of {suppliers.length} suppliers
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Top Locations</span>
          </div>
          <p className="text-sm text-purple-700 mt-1">
            {(() => {
              const countries = suppliers.map(s => s.headquartersCountry).filter(Boolean);
              const countryCount = {};
              countries.forEach(country => {
                countryCount[country] = (countryCount[country] || 0) + 1;
              });
              const topCountries = Object.entries(countryCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([country]) => country)
                .join(', ');
              return topCountries || 'N/A';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupplierMap; 