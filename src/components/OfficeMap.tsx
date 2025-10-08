import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Globe, MapPin } from 'lucide-react';

interface Office {
  city: string;
  country: string;
  address: string;
  phone: string | null;
  flag: string;
  coordinates: [number, number]; // [lng, lat]
}

const offices: Office[] = [
  {
    city: "Paris",
    country: "France",
    address: "102 avenue des Champs Elysées 75008 Paris",
    phone: null,
    flag: "🇫🇷",
    coordinates: [2.2950, 48.8738]
  },
  {
    city: "Ibiza",
    country: "Espagne",
    address: "Calle Cervantes, 48B, 07820, Sant Antoni de Portmany Ibiza, Islas Baleares",
    phone: "+34 682 87 66 73",
    flag: "🇪🇸",
    coordinates: [1.3035, 38.9669]
  },
  {
    city: "Miami",
    country: "États-Unis",
    address: "1221 Brickell Avenue, Brickell, Suite 900, Miami, FL, 33131, USA",
    phone: null,
    flag: "🇺🇸",
    coordinates: [-80.1918, 25.7617]
  },
  {
    city: "Bucarest",
    country: "Roumanie",
    address: "6-8, Corneliu Coposu Boulevard, Building Unirii View, Floors 1-3, Bucharest, 030167, ROU",
    phone: null,
    flag: "🇷🇴",
    coordinates: [26.1025, 44.4268]
  },
  {
    city: "Bangkok",
    country: "Thaïlande",
    address: "The Ninth Tower A, 35th floor, Huai Kwang, Bangkok",
    phone: null,
    flag: "🇹🇭",
    coordinates: [100.5018, 13.7563]
  }
];

export default function OfficeMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(
          'https://fepxacqrrjvnvpgzwhyr.supabase.co/functions/v1/get-mapbox-token',
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch Mapbox token');
        }

        const data = await response.json();
        setMapboxToken(data.token);
        setError(null);
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError('Impossible de charger la carte. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [20, 30], // Centered to show all offices
      zoom: 1.5,
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add markers and prepare bounds
    const bounds = new mapboxgl.LngLatBounds();
    offices.forEach((office) => {
      const popup = new mapboxgl.Popup({
        offset: 25,
        className: 'office-popup'
      }).setHTML(`
        <div class="p-3">
          <h3 class="font-semibold text-lg flex items-center gap-2">
            <span class="text-xl">${office.flag}</span>
            ${office.city}
          </h3>
          <p class="text-sm text-muted-foreground">${office.country}</p>
          <p class="text-sm mt-1">${office.address}</p>
          ${office.phone ? `<p class="text-sm text-primary mt-1">${office.phone}</p>` : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker({
        color: '#8B5CF6',
        scale: 1.2
      })
        .setLngLat(office.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      bounds.extend(office.coordinates as [number, number]);

      // Add click handler to marker
      marker.getElement().addEventListener('click', () => {
        setSelectedOffice(office);
      });
    });

    // Fit map to show all markers once loaded
    map.current?.once('load', () => {
      try {
        if (offices.length === 1) {
          map.current?.setCenter(offices[0].coordinates).setZoom(10);
        } else {
          map.current?.fitBounds(bounds, { padding: 60, maxZoom: 4, duration: 800 });
        }
      } catch (e) {
        console.error('Map fit error', e);
      }
    });

    // Log map errors for debugging
    map.current?.on('error', (e) => {
      console.error('Mapbox error', (e as any)?.error || e);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold">Chargement de la carte...</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Préparation de la carte interactive de nos bureaux
          </p>
        </div>
      </Card>
    );
  }

  if (error || !mapboxToken) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Erreur de chargement</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {error || 'Impossible de charger la carte pour le moment.'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            Nos Bureaux dans le Monde
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Présence Internationale</h2>
        <p className="text-muted-foreground">
          Découvrez l'emplacement de nos bureaux et contactez celui le plus proche de vous
        </p>
      </div>

      <Card className="relative overflow-hidden">
        <div ref={mapContainer} className="h-96 w-full" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/5" />
      </Card>

      {selectedOffice && (
        <Card className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{selectedOffice.flag}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{selectedOffice.city}</h3>
              <p className="text-sm text-muted-foreground mb-2">{selectedOffice.country}</p>
              <p className="text-sm">{selectedOffice.address}</p>
              {selectedOffice.phone && (
                <p className="text-sm text-primary mt-1">{selectedOffice.phone}</p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}