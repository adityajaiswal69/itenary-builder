import React, { useState, useEffect, useRef, useMemo } from 'react';
import { City, Country, State } from 'country-state-city';
import { Input } from './ui/input';
import { ChevronDown, X } from 'lucide-react';

interface LocationOption {
  id: string;
  name: string;
  displayName: string;
  country: string;
  state?: string;
}

interface LocationAutocompleteProps {
  onLocationSelect: (location: string) => void;
  placeholder?: string;
  value?: string;
  className?: string;
}

// Create a singleton city loader to avoid multiple API calls
class CityLoader {
  private static instance: CityLoader;
  private cities: LocationOption[] = [];
  private loaded = false;
  private loading = false;
  private loadPromise: Promise<LocationOption[]> | null = null;

  static getInstance(): CityLoader {
    if (!CityLoader.instance) {
      CityLoader.instance = new CityLoader();
    }
    return CityLoader.instance;
  }

  async getCities(): Promise<LocationOption[]> {
    if (this.loaded) {
      return this.cities;
    }

    if (this.loading && this.loadPromise) {
      return this.loadPromise;
    }

    this.loading = true;
    this.loadPromise = this.loadCitiesInternal();
    
    try {
      this.cities = await this.loadPromise;
      this.loaded = true;
      return this.cities;
    } finally {
      this.loading = false;
    }
  }

  private async loadCitiesInternal(): Promise<LocationOption[]> {
    return new Promise((resolve) => {
      // Use setTimeout to avoid blocking the UI
      setTimeout(() => {
        try {
          const countries = Country.getAllCountries();
          const cities: LocationOption[] = [];

          // Prioritize major countries for better initial results
          const majorCountries = ['IN', 'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'JP', 'CN'];
          const sortedCountries = [
            ...countries.filter(c => majorCountries.includes(c.isoCode)),
            ...countries.filter(c => !majorCountries.includes(c.isoCode))
          ];

          for (const country of sortedCountries) {
            const states = State.getStatesOfCountry(country.isoCode);
            
            if (states.length > 0) {
              // Country has states, get cities for each state
              for (const state of states) {
                const stateCities = City.getCitiesOfState(country.isoCode, state.isoCode);
                if (stateCities) {
                  for (const city of stateCities) {
                    cities.push({
                      id: `${city.name}-${state.name}-${country.name}`,
                      name: city.name,
                      displayName: `${city.name}, ${state.name}, ${country.name}`,
                      country: country.name,
                      state: state.name
                    });
                  }
                }
              }
            } else {
              // Country doesn't have states, get cities directly
              const countryCities = City.getCitiesOfCountry(country.isoCode);
              if (countryCities) {
                for (const city of countryCities) {
                  cities.push({
                    id: `${city.name}-${country.name}`,
                    name: city.name,
                    displayName: `${city.name}, ${country.name}`,
                    country: country.name
                  });
                }
              }
            }
          }

          // Sort cities alphabetically
          cities.sort((a, b) => a.name.localeCompare(b.name));
          resolve(cities);
        } catch (error) {
          console.error('Error loading cities:', error);
          resolve([]);
        }
      }, 0);
    });
  }

  isLoading(): boolean {
    return this.loading;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onLocationSelect,
  placeholder = "Search for a city...",
  value = "",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState("");

  // Only use the value prop for initial state, then manage internally
  useEffect(() => {
    if (value === '') {
      setInputValue('');
    }
  }, [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [allCities, setAllCities] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cityLoader = useMemo(() => CityLoader.getInstance(), []);

  // Load cities when component mounts or when user starts typing
  useEffect(() => {
    const loadCities = async () => {
      if (cityLoader.isLoaded()) {
        setAllCities(await cityLoader.getCities());
        return;
      }

      if (inputValue.length >= 3 && !cityLoader.isLoading()) {
        setLoading(true);
        try {
          const cities = await cityLoader.getCities();
          setAllCities(cities);
        } catch (error) {
          console.error('Failed to load cities:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCities();
  }, [inputValue, cityLoader]);

  // Filter cities based on input with optimized search
  const filteredCities = useMemo(() => {
    if (inputValue.length < 3 || allCities.length === 0) {
      return [];
    }

    const searchTerm = inputValue.toLowerCase().trim();
    
    // Search with priority: exact name match > starts with > contains
    const exactMatches: LocationOption[] = [];
    const startsWithMatches: LocationOption[] = [];
    const containsMatches: LocationOption[] = [];

    for (const city of allCities) {
      const cityName = city.name.toLowerCase();
      const countryName = city.country.toLowerCase();
      const stateName = city.state?.toLowerCase() || '';

      if (cityName === searchTerm) {
        exactMatches.push(city);
      } else if (cityName.startsWith(searchTerm) || countryName.startsWith(searchTerm) || stateName.startsWith(searchTerm)) {
        startsWithMatches.push(city);
      } else if (cityName.includes(searchTerm) || countryName.includes(searchTerm) || stateName.includes(searchTerm)) {
        containsMatches.push(city);
      }

      // Limit total results for performance
      if (exactMatches.length + startsWithMatches.length + containsMatches.length >= 15) {
        break;
      }
    }

    return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, 10);
  }, [inputValue, allCities]);

  // Update isOpen based on filtered results
  useEffect(() => {
    setIsOpen(filteredCities.length > 0 && inputValue.length >= 3);
    setSelectedIndex(-1);
  }, [filteredCities, inputValue]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle city selection
  const handleCitySelect = (city: LocationOption) => {
    // Clear the input immediately for better UX
    setInputValue('');
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Notify parent component about the selection
    onLocationSelect(city.displayName);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredCities.length) {
          handleCitySelect(filteredCities[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear input
  const clearInput = () => {
    setInputValue('');
    setIsOpen(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-20"
          autoComplete="off"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={clearInput}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {loading && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-3 text-center text-sm text-gray-500">
          Loading cities...
        </div>
      )}

      {isOpen && !loading && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
        >
          {filteredCities.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                {filteredCities.length} result{filteredCities.length > 1 ? 's' : ''} found
              </div>
              {filteredCities.map((city, index) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="font-medium">{city.name}</div>
                  <div className="text-sm text-gray-500">
                    {city.state ? `${city.state}, ${city.country}` : city.country}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              {inputValue.length < 3 
                ? 'Type at least 3 characters to search'
                : 'No cities found'
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};