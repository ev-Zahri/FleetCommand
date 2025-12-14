import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import { addDashboardClient, removeDashboardClient } from "./websocket.js";
import { driverRoutes } from "./routes/drivers.js";

const fastify = Fastify({
    logger: true,
})

// CORS configuration
await fastify.register(fastifyCors, {
    origin: true, // Allow all origins in development
})

// WebSocket support
await fastify.register(fastifyWebsocket)

// Register driver routes
await fastify.register(driverRoutes)

// WebSocket endpoint for dashboard live tracking
fastify.register(async function (fastify) {
    fastify.get('/ws/tracking', { websocket: true }, (connection, request) => {
        console.log('Dashboard client connected');
        
        // Add client to broadcast list
        addDashboardClient(connection);
        
        connection.on('message', (message: { toString: () => string }) => {
            const text = message.toString();
            console.log('Received from dashboard:', text);
        });
        
        connection.on('close', () => {
            console.log('Dashboard client disconnected');
            removeDashboardClient(connection);
        });
        
        connection.on('error', (error: Error) => {
            console.error('WebSocket error:', error);
            removeDashboardClient(connection);
        });
    })
})

// Health check endpoint
fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
})

const PORT = process.env.PORT || 3001;

const start = async () => {
    try {
        await fastify.listen({ port: Number(PORT), host: '0.0.0.0' })
        console.log(`🚀 Server running on http://localhost:${PORT}`)
        console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws/tracking`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start();
