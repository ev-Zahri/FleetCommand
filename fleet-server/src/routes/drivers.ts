import type { FastifyInstance } from 'fastify';
import { updateDriverLocation, getAllDriverLocations, updateDriverStatus, type DriverLocation } from '../websocket.js';

export async function driverRoutes(fastify: FastifyInstance): Promise<void> {
    // Get all drivers with current locations
    fastify.get('/api/drivers', async (request, reply) => {
        const drivers = getAllDriverLocations();
        return reply.send({ drivers });
    });

    // Update driver location (called by driver app or simulator)
    fastify.post<{
        Params: { id: string };
        Body: {
            latitude: number;
            longitude: number;
            heading?: number;
            speed?: number;
            name?: string;
            status?: 'idle' | 'busy' | 'offline';
        };
    }>('/api/drivers/:id/location', async (request, reply) => {
        const driverId = parseInt(request.params.id, 10);
        const { latitude, longitude, heading = 0, speed = 0, name, status = 'idle' } = request.body;

        const driver: DriverLocation = {
            id: driverId,
            name: name || `Driver ${driverId}`,
            status,
            latitude,
            longitude,
            heading,
            speed,
            updatedAt: new Date()
        };

        updateDriverLocation(driver);

        return reply.send({ success: true, driver });
    });

    // Update driver status
    fastify.patch<{
        Params: { id: string };
        Body: { status: 'idle' | 'busy' | 'offline' };
    }>('/api/drivers/:id/status', async (request, reply) => {
        const driverId = parseInt(request.params.id, 10);
        const { status } = request.body;

        updateDriverStatus(driverId, status);

        return reply.send({ success: true });
    });
}
