'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORS } from '@/app/constants/colors';
import { MapPin, Navigation, Map } from 'lucide-react';

// Fix for Leaflet marker icons in Next.js
interface StoreLocationMapProps {
    storeName: string;
    town?: string;
    latitude?: number;
    longitude?: number;
    className?: string;
}

// Component to enable map dragging and handle resize
function MapController({ position }: { position: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (map) {
            // Make sure dragging is enabled
            map.dragging.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.scrollWheelZoom.enable();

            // Center the map on the position
            map.setView(position, 14);

            // Handle resize
            const resizeObserver = new ResizeObserver(() => {
                map.invalidateSize();
            });

            const container = map.getContainer();
            resizeObserver.observe(container);

            return () => {
                resizeObserver.unobserve(container);
            };
        }
    }, [map, position]);

    return null;
}

const StoreLocationMap: React.FC<StoreLocationMapProps> = ({
    storeName,
    town,
    latitude,
    longitude,
    className = '',
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [defaultPosition, setDefaultPosition] = useState<[number, number]>([7.1907, 125.4553]); // Default to Davao City, Philippines

    // Fix for Leaflet marker icons in Next.js
    useEffect(() => {
        setIsMounted(true);

        // Fix Leaflet icon issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // If we have coordinates, use them
        if (latitude && longitude) {
            setDefaultPosition([latitude, longitude]);
        }
        // Otherwise, try to geocode the town if available
        else if (town) {
            console.log(`Would geocode town: ${town}`);
        }
    }, [latitude, longitude, town]);

    // Custom marker icon with store color
    const customIcon = new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    if (!isMounted) {
        return (
            <Card className={`w-full shadow-md ${className}`}>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-gray-700">
                        <Map className="mr-2 text-gray-400" size={20} />
                        Store Location
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="flex flex-col items-center p-6">
                            <div className="animate-pulse w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
                            <p className="text-gray-500">Loading map...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`w-full shadow-md hover:shadow-lg transition-shadow ${className}`}>
            <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center text-lg font-medium">
                    <Map className="mr-2" size={20} style={{ color: COLORS.accent }} />
                    {storeName} Location
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                {(latitude && longitude) || town ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                        <div className="relative h-96 w-full">
                            <MapContainer
                                center={defaultPosition}
                                zoom={14}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                                className="z-0"
                            >
                                <TileLayer
                                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <ZoomControl position="bottomright" />
                                <Marker position={defaultPosition} icon={customIcon}>
                                    <Popup className="custom-popup">
                                        <div className="p-1">
                                            <strong className="block text-base mb-1" style={{ color: COLORS.accent }}>{storeName}</strong>
                                            {town && <div className="text-gray-600 text-sm">{town}</div>}
                                        </div>
                                    </Popup>
                                </Marker>
                                <MapController position={defaultPosition} />
                            </MapContainer>
                        </div>

                        {/* Info panel */}
                        <div className="bg-white p-4 border-t border-gray-200">
                            <div className="flex items-start">
                                <div className="bg-gray-100 p-2 rounded-full mr-3">
                                    <MapPin size={16} style={{ color: COLORS.accent }} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">{storeName}</h4>
                                    {town && <p className="text-gray-600 text-xs mt-1">{town}</p>}
                                    {latitude && longitude && (
                                        <div className="flex items-center mt-2">
                                            <Navigation size={12} className="text-gray-400 mr-1" />
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-500 hover:underline"
                                            >
                                                Get directions
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-96 bg-gray-50 rounded-lg flex flex-col items-center justify-center p-6 border border-dashed border-gray-200">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <MapPin size={24} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium mb-1">No location available</p>
                        <p className="text-gray-400 text-sm text-center">Location information for this store hasn't been added yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default StoreLocationMap;