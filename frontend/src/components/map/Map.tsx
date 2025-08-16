import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    id: string;
    coordinates: [number, number];
    popupContent?: string;
  }>;
  onClick?: (event: maplibregl.MapMouseEvent) => void;
  onMarkerClick?: (markerId: string) => void;
}

export function Map({
  center,
  zoom,
  markers = [],
  onClick,
  onMarkerClick,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Free demo style
      center: center,
      zoom: zoom,
    });

    if (onClick) {
      map.current.on('click', onClick);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Handle markers
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add new markers
    markers.forEach((marker) => {
      const element = document.createElement('div');
      element.className = 'w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer';
      element.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>';

      if (onMarkerClick) {
        element.addEventListener('click', () => onMarkerClick(marker.id));
      }

      const markerInstance = new maplibregl.Marker(element)
        .setLngLat(marker.coordinates)
        .addTo(map.current!);

      if (marker.popupContent) {
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
          marker.popupContent
        );
        markerInstance.setPopup(popup);
      }

      markersRef.current[marker.id] = markerInstance;
    });
  }, [markers]);

  return (
    <div
      ref={mapContainer}
      className="h-full w-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
}
