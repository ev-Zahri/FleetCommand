'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWebSocket } from '../lib/websocket';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const DriverMarker = dynamic(
    () => import('./DriverMarker'),
    { ssr: false }
);

// Jakarta center coordinates
const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 13;

export default function LiveTrackingMap() {
    const { drivers, isConnected, error } = useWebSocket();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Count drivers by status
    const statusCounts = {
        idle: 0,
        busy: 0,
        offline: 0
    };

    drivers.forEach(driver => {
        statusCounts[driver.status]++;
    });

    if (!isMounted) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg">Loading map...</div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            {/* Connection Status Bar */}
            <div className="absolute top-4 left-4 z-[1000] bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-white font-medium">
                        {isConnected ? 'Live' : 'Disconnected'}
                    </span>
                </div>
                
                {/* Driver Stats */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-gray-300">Available: {statusCounts.idle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-gray-300">On Delivery: {statusCounts.busy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <span className="text-gray-300">Offline: {statusCounts.offline}</span>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700">
                    <span className="text-gray-400 text-xs">
                        Total Drivers: {drivers.size}
                    </span>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="absolute top-4 right-4 z-[1000] bg-red-500/90 text-white px-4 py-2 rounded-lg">
                    {error}
                </div>
            )}

            {/* Map */}
            <MapContainer
                center={JAKARTA_CENTER}
                zoom={DEFAULT_ZOOM}
                className="w-full h-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Render all driver markers */}
                {Array.from(drivers.values()).map(driver => (
                    <DriverMarker key={driver.id} driver={driver} />
                ))}
            </MapContainer>
        </div>
    );
}
