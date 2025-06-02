import React, { useState, useEffect } from "react";
 
export interface Address {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
  value?: string;
  label?: string;
  custom?: boolean;
  postcode?: string;
}
 
interface Suggestion {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
    [key: string]: string | undefined;
  };
}
 
interface LocationSearchProps {
  onSelect: (location: Address) => void;
  placeholder?: string;
  className?: string;
  maxCustomLength?: number;
}
 
const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelect,
  placeholder = "Type a city...",
  className = "",
  maxCustomLength = 100
}) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [noResultsFound, setNoResultsFound] = useState<boolean>(false);
 
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setNoResultsFound(false);
      }
    }, 500);
 
    return () => clearTimeout(delayDebounce);
  }, [query]);
 
  const fetchSuggestions = async (input: string) => {
    setLoading(true);
    setNoResultsFound(false);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          input
        )}&format=json&addressdetails=1&limit=5`,
        {
   
          headers: {
            "User-Agent": "TravelRequestApp (admin@travelrequestapp.com)",
          },
        }
      );
      const data = await response.json();
      const filtered: Suggestion[] = data.filter(
        (item: any) =>
          item.address &&
          (item.address.city || item.address.town || item.address.village)
      );
   
      setSuggestions(filtered);
     
      // Only show custom option when no results found
      setNoResultsFound(filtered.length === 0 && query.trim().length > 0);
    } catch (error) {
      console.error("Fetch error:", error);
      // If API fails, allow custom entry
      setNoResultsFound(true);
    } finally {
      setLoading(false);
    }
  };
 
  const handleSelect = (suggestion: Suggestion) => {
    const address = suggestion.address;
   
    // Get the display name but remove any postal code (postcode)
    let displayName = suggestion.display_name;
   
    // If there's a postcode in the address, remove it from the display name
    if (address.postcode) {
      // Replace the postcode and any preceding commas/spaces
      displayName = displayName.replace(new RegExp(`(,\\s*)?${address.postcode}(,\\s*)?`, 'g'), ', ');
      // Clean up any double commas that might have been created
      displayName = displayName.replace(/,\s*,/g, ',');
      // Trim any trailing commas and spaces
      displayName = displayName.replace(/,\s*$/, '');
    }
   
    // Prepare location data in format expected by the rest of the application
    const cityPart = address.city || address.town || address.village || "";
    const statePart = address.state || "";
    const countryPart = address.country || "";
   
    const locationData: Address = {
      city: cityPart,
      state: statePart,
      country: countryPart,
      // Generate value and label for react-select
      value: `${cityPart}-${statePart}-${countryPart}`.toLowerCase().replace(/\s+/g, '-'),
      label: displayName, // Use the cleaned display name from the API
      postcode: address.postcode // Store the postcode but we won't display it
    };
   
    onSelect(locationData);
    setQuery(displayName);
    setSuggestions([]);
  };
 
  const handleCustomSelect = () => {
    if (!noResultsFound || query.trim().length === 0) return;
   
    // Try to parse the custom entry for city, state, country format
    const parts = query.split(',').map(part => part.trim());
   
    let cityPart = "";
    let statePart = "";
    let countryPart = "";
   
    if (parts.length === 1) {
      // Only city provided
      cityPart = parts[0];
    } else if (parts.length === 2) {
      // City and Country
      cityPart = parts[0];
      countryPart = parts[1]; // Last element is country
    } else if (parts.length === 3) {
      // City, State, Country
      cityPart = parts[0];
      statePart = parts[1];
      countryPart = parts[2]; // Last element is country
    } else if (parts.length >= 4) {
      // City, District/Area, State, Country (like Kochi, Ernakulam, Kerala, India)
      cityPart = parts[0];
      statePart = parts[parts.length - 2]; // Second to last is state
      countryPart = parts[parts.length - 1]; // Last element is country
    }
   
    const locationData: Address = {
      city: cityPart,
      state: statePart,
      country: countryPart,
      value: `${cityPart}-${statePart}-${countryPart}`.toLowerCase().replace(/\s+/g, '-'),
      label: query, // For custom entries, use the input as is
      custom: true
    };
   
    onSelect(locationData);
    setSuggestions([]);
    setNoResultsFound(false);
  };
 
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && noResultsFound) {
      e.preventDefault();
      handleCustomSelect();
    }
  };
 
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          // Limit the length for custom entries
          if (e.target.value.length <= maxCustomLength) {
            setQuery(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
      />
 
      {loading && (
        <div className="absolute right-3 top-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
 
      {suggestions.length > 0 && (
        <ul
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          {suggestions.map((suggestion, index) => {
            // Clean the display name for the suggestion list
            let displayName = suggestion.display_name;
            if (suggestion.address && suggestion.address.postcode) {
              // Remove postal code from display name
              displayName = displayName.replace(new RegExp(`(,\\s*)?${suggestion.address.postcode}(,\\s*)?`, 'g'), ', ');
              displayName = displayName.replace(/,\s*,/g, ',');
              displayName = displayName.replace(/,\s*$/, '');
            }
           
            return (
              <li
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="relative cursor-pointer select-none py-2 px-3 hover:bg-primary/10"
              >
                {displayName}
              </li>
            );
          })}
        </ul>
      )}
     
      {noResultsFound && (
        <ul
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <li
            onClick={handleCustomSelect}
            className="relative cursor-pointer select-none py-2 px-3 hover:bg-primary/10 flex items-center"
          >
            <span className="text-primary font-medium">Use custom:</span>
            <span className="ml-2">{query}</span>
          </li>
        </ul>
      )}
     
      {/* Display character count if near limit */}
      {query.length > maxCustomLength * 0.8 && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {query.length}/{maxCustomLength}
        </div>
      )}
    </div>
  );
};
 
export default LocationSearch;