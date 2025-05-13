import React, { useState, useEffect } from "react";
 
export interface Address {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
  value?: string;
  label?: string;
}
 
interface Suggestion {
  display_name: string;
  address: Address;
}

interface LocationSearchProps {
  onSelect: (location: Address) => void;
  placeholder?: string;
  className?: string;
}
 
const LocationSearch: React.FC<LocationSearchProps> = ({ 
  onSelect, 
  placeholder = "Type a city...",
  className = ""
}) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
 
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 500); // debounce
 
    return () => clearTimeout(delayDebounce);
  }, [query]);
 
  const fetchSuggestions = async (input: string) => {
    setLoading(true);
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
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
 
  const handleSelect = (suggestion: Suggestion) => {
    const address = suggestion.address;
    // Prepare location data in format expected by the rest of the application
    const locationData: Address = {
      city: address.city || address.town || address.village || "",
      state: address.state || "",
      country: address.country || "",
      // Generate value and label for react-select
      value: `${address.city || address.town || address.village || ""}-${address.country || ""}`.toLowerCase().replace(/\s+/g, '-'),
      label: `${address.city || address.town || address.village || ""}, ${address.country || ""}`
    };
    
    onSelect(locationData);
    setQuery(locationData.label || "");
    setSuggestions([]);
  };
 
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="relative cursor-pointer select-none py-2 px-3 hover:bg-primary/10"
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
 
export default LocationSearch;