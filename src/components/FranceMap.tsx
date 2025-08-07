// components/TailwindLeafletFranceMap.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TailwindLeafletFranceMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGeojsonData = async () => {
      try {
        const response = await fetch('/data/RegionsMap.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGeojsonData(data);
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
        setError('Failed to load region data');
      } finally {
        setLoading(false);
      }
    };

    loadGeojsonData();
  }, []);

  useEffect(() => {
    if (!geojsonData || !mapRef.current) return;

    // Create minimal map
    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: false,
      attributionControl: false,
      preferCanvas: true
    });

    // Create GeoJSON layer
    const geojsonLayer = L.geoJSON(geojsonData, {
      style: (feature) => ({
        fillColor: selectedRegion === feature?.properties?.code ? '#3b82f6' : '#1e293b', // Navy blue instead of gray
        weight: 2,
        opacity: 1,
        color: '#ffffff',
        fillOpacity: 0.8
      }),
      onEachFeature: (feature, layer) => {
        layer.on({
          click: () => {
            const regionCode = feature.properties?.code;
            setSelectedRegion(selectedRegion === regionCode ? null : regionCode);
          },
          mouseover: (e) => {
            e.target.setStyle({
              fillColor: selectedRegion === feature.properties?.code ? '#2563eb' : '#334155', // Lighter navy on hover
              fillOpacity: 0.9,
              weight: 3
            });
            
            // Add cursor pointer
            mapInstance.current!.getContainer().style.cursor = 'pointer';
          },
          mouseout: (e) => {
            e.target.setStyle({
              fillColor: selectedRegion === feature.properties?.code ? '#3b82f6' : '#1e293b', // Back to navy
              fillOpacity: 0.8,
              weight: 2
            });
            
            // Reset cursor
            mapInstance.current!.getContainer().style.cursor = '';
          }
        });

        // No tooltips - we'll add permanent labels instead
      }
    });

    geojsonLayer.addTo(mapInstance.current);

    // Add permanent region labels
    geojsonData.features.forEach((feature: any) => {
      if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        // Calculate centroid for label placement
        let coordinates = feature.geometry.coordinates;
        let centroid;

        if (feature.geometry.type === 'Polygon') {
          // Simple centroid calculation for polygon
          const coords = coordinates[0];
          let x = 0, y = 0;
          coords.forEach((coord: [number, number]) => {
            x += coord[0];
            y += coord[1];
          });
          centroid = [x / coords.length, y / coords.length];
        } else {
          // For MultiPolygon, use the first polygon's centroid
          const coords = coordinates[0][0];
          let x = 0, y = 0;
          coords.forEach((coord: [number, number]) => {
            x += coord[0];
            y += coord[1];
          });
          centroid = [x / coords.length, y / coords.length];
        }

        // Add permanent label
        const regionName = feature.properties?.nom || 'Unknown';
        L.marker([centroid[1], centroid[0]], {
          icon: L.divIcon({
            className: 'region-label',
            html: `<div style="
              color: white; 
              font-size: 12px; 
              font-weight: bold; 
              text-align: center; 
              background: rgba(0,0,0,0.6); 
              padding: 2px 6px; 
              border-radius: 4px;
              white-space: nowrap;
              pointer-events: none;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            ">${regionName}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          })
        }).addTo(mapInstance.current!);
      }
    });

    // Fit map to bounds with much more zoom (minimal padding = much bigger regions)
    mapInstance.current.fitBounds(geojsonLayer.getBounds(), {
      padding: [0, 0], // No padding at all - fills entire container
      maxZoom: 12 // Much higher max zoom for very close view
    });

    // Style the map container background to be transparent
    const mapContainer = mapInstance.current.getContainer();
    mapContainer.style.background = 'transparent'; // Make transparent to show video below

    // Hide tile layers if any exist
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstance.current!.removeLayer(layer);
      }
    });

    // Clean up on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [geojsonData]);

  // Update styles when selection changes
  useEffect(() => {
    if (mapInstance.current && geojsonData) {
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON) {
          layer.eachLayer((subLayer: any) => {
            const feature = subLayer.feature;
            if (feature) {
              subLayer.setStyle({
                fillColor: selectedRegion === feature.properties?.code ? '#3b82f6' : '#1e293b' // Navy blue default
              });
            }
          });
        }
      });
    }
  }, [selectedRegion, geojsonData]);

  // Add custom tooltip styling when map loads
  useEffect(() => {
    // Remove tooltip styling since we're not using tooltips anymore
  }, [mapInstance.current]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-50 rounded-lg border border-gray-200">
        <div className="text-gray-500 font-medium">Loading France regions...</div>
      </div>
    );
  }

  if (error || !geojsonData) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-50 rounded-lg border border-gray-200">
        <div className="text-red-500 font-medium">{error || 'Failed to load region data'}</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-1/2 relative">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-[48rem] object-cover rounded-lg"
          style={{ zIndex: 1 }}
        >
          <source src="/videos/french-flag.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Map container positioned above video */}
        <div 
          ref={mapRef} 
          className="relative w-full h-[48rem] rounded-lg shadow-sm"
          style={{ zIndex: 2 }}
        />
      </div>
    </div>
  );
}