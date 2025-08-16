import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/useTranslations';
import { Map } from './Map';
import { SearchFilters } from '@/components/search/SearchFilters';
import { CraftsmanCard } from '@/components/craftsmen/CraftsmanCard';

interface Craftsman {
  id: string;
  name: string;
  avatar: string;
  crafts: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: {
    coordinates: [number, number];
  };
  distance: number;
  nextAvailable?: string;
}

interface MapSearchProps {
  initialCenter: [number, number];
  initialZoom: number;
  craftsmen: Craftsman[];
  onFilterChange: (filters: any) => void;
}

export function MapSearch({
  initialCenter,
  initialZoom,
  craftsmen,
  onFilterChange,
}: MapSearchProps) {
  const t = useTranslations();
  const [selectedCraftsman, setSelectedCraftsman] = useState<string | null>(null);
  const [view, setView] = useState<'map' | 'list'>('map');

  const markers = craftsmen.map((craftsman) => ({
    id: craftsman.id,
    coordinates: craftsman.location.coordinates,
    popupContent: `
      <div class="p-2">
        <h3 class="font-semibold">${craftsman.name}</h3>
        <p class="text-sm">${craftsman.crafts.join(', ')}</p>
        <p class="text-sm font-medium">${craftsman.hourlyRate} EGP/hour</p>
      </div>
    `,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4">
        <SearchFilters onFilterChange={onFilterChange} />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {craftsmen.length} professionals found
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('list')}
              className={`rounded-md px-3 py-1 ${
                view === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('map')}
              className={`rounded-md px-3 py-1 ${
                view === 'map'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Map
            </button>
          </div>
        </div>
        <div className="space-y-4 lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto">
          {craftsmen.map((craftsman) => (
            <CraftsmanCard
              key={craftsman.id}
              {...craftsman}
              className={
                selectedCraftsman === craftsman.id ? 'ring-2 ring-primary' : ''
              }
              onClick={() => setSelectedCraftsman(craftsman.id)}
            />
          ))}
        </div>
      </div>

      <div className="col-span-2 h-[calc(100vh-8rem)] lg:sticky lg:top-24">
        {view === 'map' && (
          <Map
            center={initialCenter}
            zoom={initialZoom}
            markers={markers}
            onMarkerClick={setSelectedCraftsman}
          />
        )}
      </div>
    </div>
  );
}
