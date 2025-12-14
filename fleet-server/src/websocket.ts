import type { WebSocket } from '@fastify/websocket';

// Store connected dashboard clients
const dashboardClients: Set<WebSocket> = new Set();

// Store current driver locations (in-memory cache)
export interface DriverLocation {
    id: number;
    name: string;
    status: 'idle' | 'busy' | 'offline';
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    updatedAt: Date;
}

const driverLocations: Map<number, DriverLocation> = new Map();

// Add a dashboard client
export function addDashboardClient(ws: WebSocket): void {
    dashboardClients.add(ws);
    console.log(`Dashboard client connected. Total clients: ${dashboardClients.size}`);
    
    // Send current driver locations to the new client
    const locations = Array.from(driverLocations.values());
    ws.send(JSON.stringify({
        type: 'init',
        drivers: locations
    }));
}

// Remove a dashboard client
export function removeDashboardClient(ws: WebSocket): void {
    dashboardClients.delete(ws);
    console.log(`Dashboard client disconnected. Total clients: ${dashboardClients.size}`);
}

// Update driver location and broadcast to all clients
export function updateDriverLocation(driver: DriverLocation): void {
    driverLocations.set(driver.id, driver);
    
    // Broadcast to all connected dashboard clients
    const message = JSON.stringify({
        type: 'location_update',
        driver
    });
    
    for (const client of dashboardClients) {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    }
}

// Get all driver locations
export function getAllDriverLocations(): DriverLocation[] {
    return Array.from(driverLocations.values());
}

// Update driver status
export function updateDriverStatus(driverId: number, status: 'idle' | 'busy' | 'offline'): void {
    const driver = driverLocations.get(driverId);
    if (driver) {
        driver.status = status;
        driver.updatedAt = new Date();
        updateDriverLocation(driver);
    }
}
