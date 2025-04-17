"use client";

import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Sample location suggestions for demonstration
const LOCATION_SUGGESTIONS = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA"
];

interface LocationModalProps {
  onClose: () => void;
  onLocationSet: (location: string) => void;
}

export function LocationModal({ onClose, onLocationSet }: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Filter suggestions based on search query
  const filteredSuggestions = searchQuery
    ? LOCATION_SUGGESTIONS.filter(location =>
        location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, you might want to fetch suggestions from an API
    setSuggestions(filteredSuggestions);
  };

  const handleSelectLocation = (location: string) => {
    onLocationSet(location);
    setIsOpen(false);
  };

  const handleUseCurrentLocation = () => {
    setUsingCurrentLocation(true);
    
    // Use browser geolocation API to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would reverse geocode the coordinates to get a location name
          // For this example, we'll just use the coordinates
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          const locationString = `Current Location (${lat}, ${lng})`;
          onLocationSet(locationString);
          setUsingCurrentLocation(false);
          setIsOpen(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUsingCurrentLocation(false);
          // Fallback to a default location
          onLocationSet("Default Location");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUsingCurrentLocation(false);
      // Fallback to a default location
      onLocationSet("Default Location");
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) onClose();
      }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Set Your Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a city or zip code..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {searchQuery && filteredSuggestions.length > 0 && (
              <div className="mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex cursor-pointer items-center px-4 py-2 hover:bg-slate-100"
                    onClick={() => handleSelectLocation(suggestion)}
                  >
                    <MapPin className="mr-2 h-4 w-4 text-slate-500" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery && filteredSuggestions.length === 0 && (
              <div className="mt-1 rounded-md border bg-white p-4 text-center text-sm text-muted-foreground">
                No locations found. Try a different search term.
              </div>
            )}
          </div>
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleUseCurrentLocation}
              disabled={usingCurrentLocation}
            >
              <MapPin className="mr-2 h-4 w-4 text-blue-500" />
              {usingCurrentLocation ? "Getting your location..." : "Use my current location"}
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Suggested Locations</p>
            <div className="grid grid-cols-2 gap-2">
              {LOCATION_SUGGESTIONS.slice(0, 6).map((location, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handleSelectLocation(location)}
                >
                  <MapPin className="mr-2 h-3 w-3 text-slate-500" />
                  <span className="truncate">{location}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}