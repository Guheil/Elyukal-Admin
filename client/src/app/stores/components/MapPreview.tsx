// MapPreview.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map view
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  onCoordinatesChange?: (lat: number, lng: number) => void; // Add callback prop
}

export default function MapPreview({ latitude, longitude, onCoordinatesChange }: MapPreviewProps) {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);

  // Update position when props change
  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    if (onCoordinatesChange) {
      onCoordinatesChange(lat, lng);
    }
  };

  return (
    <div className="w-full h-120 rounded-lg overflow-hidden border">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon} />
        <ChangeMapView center={position} />
        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
}