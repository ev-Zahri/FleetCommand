'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Marker, Popup, useMap } from 'react-leaflet';
import type { DriverLocation } from '../lib/websocket';

interface DriverMarkerProps {
    driver: DriverLocation;
}

// Create custom colored icons for different statuses
function createStatusIcon(status: 'idle' | 'busy' | 'offline'): L.DivIcon {
    const colors = {
        idle: '#22c55e',    // Green
        busy: '#ef4444',    // Red
        offline: '#6b7280'  // Gray
    };

    const color = colors[status];

    return L.divIcon({
        className: 'custom-driver-marker',
        html: `
            <div style="
                width: 24px;
                height: 24px;
                background-color: ${color};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
}

// Component to animate marker movement
function AnimatedMarker({ driver }: DriverMarkerProps) {
    const map = useMap();
    const markerRef = useRef<L.Marker | null>(null);
    const prevPositionRef = useRef<[number, number]>([driver.latitude, driver.longitude]);

    useEffect(() => {
        if (!markerRef.current) return;

        const marker = markerRef.current;
        const newPosition: L.LatLngExpression = [driver.latitude, driver.longitude];
        const oldPosition = prevPositionRef.current;

        // Smooth animation using CSS transition
        const startLat = oldPosition[0];
        const startLng = oldPosition[1];
        const endLat = driver.latitude;
        const endLng = driver.longitude;
        
        const duration = 1000; // 1 second animation
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth movement
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentLat = startLat + (endLat - startLat) * easeProgress;
            const currentLng = startLng + (endLng - startLng) * easeProgress;
            
            marker.setLatLng([currentLat, currentLng]);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        if (startLat !== endLat || startLng !== endLng) {
            animate();
        }

        prevPositionRef.current = [driver.latitude, driver.longitude];
    }, [driver.latitude, driver.longitude]);

    // Update icon when status changes
    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setIcon(createStatusIcon(driver.status));
        }
    }, [driver.status]);

    const statusLabels = {
        idle: 'Available',
        busy: 'On Delivery',
        offline: 'Offline'
    };

    return (
        <Marker
            position={[driver.latitude, driver.longitude]}
            icon={createStatusIcon(driver.status)}
            ref={markerRef}
        >
            <Popup>
                <div className="min-w-[150px]">
                    <h3 className="font-bold text-lg mb-1">{driver.name}</h3>
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="font-medium">Status:</span>{' '}
                            <span style={{ 
                                color: driver.status === 'idle' ? '#22c55e' : driver.status === 'busy' ? '#ef4444' : '#6b7280'
                            }}>
                                {statusLabels[driver.status]}
                            </span>
                        </p>
                        {driver.speed > 0 && (
                            <p>
                                <span className="font-medium">Speed:</span> {driver.speed} km/h
                            </p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                            Last update: {new Date(driver.updatedAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

export default function DriverMarker({ driver }: DriverMarkerProps) {
    return <AnimatedMarker driver={driver} />;
}
