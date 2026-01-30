import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Loader2 } from 'lucide-react';

interface Location {
  address: string;
  city?: string;
  province?: string;
  barangay?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
}

interface LocationInputProps {
  value: Location | null;
  onChange: (location: Location | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showCurrentLocation?: boolean;
  className?: string;
}

// Common Philippine cities/provinces for suggestions
const PHILIPPINE_LOCATIONS = [
  'Manila, Metro Manila',
  'Quezon City, Metro Manila',
  'Makati City, Metro Manila',
  'Pasig City, Metro Manila',
  'Taguig City, Metro Manila',
  'Cebu City, Cebu',
  'Davao City, Davao del Sur',
  'Iloilo City, Iloilo',
  'Baguio City, Benguet',
  'Cagayan de Oro, Misamis Oriental',
  'Zamboanga City, Zamboanga del Sur',
  'Antipolo City, Rizal',
  'San Juan, Metro Manila',
  'Mandaluyong, Metro Manila',
  'Parañaque, Metro Manila',
];

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter your address',
  label = 'Location',
  required = false,
  showCurrentLocation = true,
  className = '',
}) => {
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value?.address) {
      setQuery(value.address);
    }
  }, [value]);

  useEffect(() => {
    // Filter suggestions based on query
    if (query.length >= 2) {
      const filtered = PHILIPPINE_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    const [city, province] = suggestion.split(', ');
    onChange({
      address: suggestion,
      city,
      province,
    });
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // In production, you would reverse geocode here
        // For now, we'll just set the coordinates
        const mockAddress = 'Current Location';
        
        setQuery(mockAddress);
        onChange({
          address: mockAddress,
          lat: latitude,
          lng: longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter it manually.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-deep-slate mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="input-field pl-10 pr-10"
          placeholder={placeholder}
          required={required}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-slate/40 hover:text-deep-slate"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-primary/5 flex items-center gap-2 text-sm"
            >
              <MapPin className="w-4 h-4 text-primary/60" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Get Current Location Button */}
      {showCurrentLocation && (
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="mt-2 text-sm text-primary hover:text-primary-dark flex items-center gap-2"
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          Use my current location
        </button>
      )}
    </div>
  );
};

export default LocationInput;
