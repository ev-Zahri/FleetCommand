'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export interface DriverLocation {
    id: number;
    name: string;
    status: 'idle' | 'busy' | 'offline';
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    updatedAt: string;
}

interface WebSocketMessage {
    type: 'init' | 'location_update';
    drivers?: DriverLocation[];
    driver?: DriverLocation;
}

interface UseWebSocketReturn {
    drivers: Map<number, DriverLocation>;
    isConnected: boolean;
    error: string | null;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws/tracking';

export function useWebSocket(): UseWebSocketReturn {
    const [drivers, setDrivers] = useState<Map<number, DriverLocation>>(new Map());
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        console.log('Connecting to WebSocket:', WS_URL);
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setError(null);
        };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);

                if (message.type === 'init' && message.drivers) {
                    // Initialize all drivers
                    const newDrivers = new Map<number, DriverLocation>();
                    for (const driver of message.drivers) {
                        newDrivers.set(driver.id, driver);
                    }
                    setDrivers(newDrivers);
                } else if (message.type === 'location_update' && message.driver) {
                    // Update single driver
                    setDrivers(prev => {
                        const updated = new Map(prev);
                        updated.set(message.driver!.id, message.driver!);
                        return updated;
                    });
                }
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
            wsRef.current = null;

            // Reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('Attempting to reconnect...');
                connect();
            }, 3000);
        };

        ws.onerror = (event) => {
            console.error('WebSocket error:', event);
            setError('Connection failed');
        };

        wsRef.current = ws;
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    return { drivers, isConnected, error };
}
