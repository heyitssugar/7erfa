import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/useTranslations';
import { Map } from './Map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface Location {
  coordinates: [number, number];
  radiusKm: number;
  address?: string;
}

interface LocationPickerProps {
  initialLocation?: Location;
  onChange: (location: Location) => void;
}

export function LocationPicker({
  initialLocation,
  onChange,
}: LocationPickerProps) {
  const t = useTranslations();
  const [location, setLocation] = useState<Location>(
    initialLocation || {
      coordinates: [31.2357, 30.0444], // Cairo coordinates
      radiusKm: 5,
    }
  );

  const handleMapClick = (event: maplibregl.MapMouseEvent) => {
    const newLocation = {
      ...location,
      coordinates: [event.lngLat.lng, event.lngLat.lat],
    };
    setLocation(newLocation);
    onChange(newLocation);
  };

  const handleRadiusChange = (value: number[]) => {
    const newLocation = {
      ...location,
      radiusKm: value[0],
    };
    setLocation(newLocation);
    onChange(newLocation);
  };

  const markers = [
    {
      id: 'selected',
      coordinates: location.coordinates,
      popupContent: `
        <div class="p-2">
          <p class="text-sm font-medium">Selected Location</p>
          <p class="text-sm">Radius: ${location.radiusKm} km</p>
        </div>
      `,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="h-[400px] rounded-lg border">
        <Map
          center={location.coordinates}
          zoom={12}
          markers={markers}
          onClick={handleMapClick}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Service Radius (km)</Label>
          <div className="flex items-center space-x-4">
            <Slider
              value={[location.radiusKm]}
              min={1}
              max={50}
              step={1}
              onValueChange={handleRadiusChange}
              className="flex-1"
            />
            <span className="w-12 text-right text-sm">
              {location.radiusKm} km
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Longitude</Label>
            <Input
              type="number"
              value={location.coordinates[0]}
              readOnly
              className="mt-1"
            />
          </div>
          <div>
            <Label>Latitude</Label>
            <Input
              type="number"
              value={location.coordinates[1]}
              readOnly
              className="mt-1"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            // Request user's current location
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newLocation = {
                    ...location,
                    coordinates: [
                      position.coords.longitude,
                      position.coords.latitude,
                    ],
                  };
                  setLocation(newLocation);
                  onChange(newLocation);
                },
                (error) => {
                  console.error('Error getting location:', error);
                }
              );
            }
          }}
        >
          Use Current Location
        </Button>
      </div>
    </div>
  );
}
