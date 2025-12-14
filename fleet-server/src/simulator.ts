/**
 * Driver Location Simulator
 * Simulates 5 drivers moving around Jakarta area
 * Run: npx tsx src/simulator.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Jakarta area bounds
const JAKARTA_CENTER = { lat: -6.2088, lng: 106.8456 };
const MOVEMENT_RANGE = 0.02; // ~2km movement range

interface SimulatedDriver {
    id: number;
    name: string;
    status: 'idle' | 'busy' | 'offline';
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
}

// Initialize 5 drivers at random positions around Jakarta
const drivers: SimulatedDriver[] = [
    { id: 1, name: 'Ahmad Kurniawan', status: 'idle', latitude: JAKARTA_CENTER.lat + 0.01, longitude: JAKARTA_CENTER.lng + 0.01, heading: 0, speed: 0 },
    { id: 2, name: 'Budi Santoso', status: 'busy', latitude: JAKARTA_CENTER.lat - 0.01, longitude: JAKARTA_CENTER.lng + 0.02, heading: 90, speed: 30 },
    { id: 3, name: 'Citra Dewi', status: 'idle', latitude: JAKARTA_CENTER.lat + 0.02, longitude: JAKARTA_CENTER.lng - 0.01, heading: 180, speed: 0 },
    { id: 4, name: 'Dedi Prasetyo', status: 'busy', latitude: JAKARTA_CENTER.lat - 0.02, longitude: JAKARTA_CENTER.lng - 0.02, heading: 270, speed: 25 },
    { id: 5, name: 'Eka Putri', status: 'offline', latitude: JAKARTA_CENTER.lat, longitude: JAKARTA_CENTER.lng, heading: 45, speed: 0 },
];

// Randomly move driver position
function moveDriver(driver: SimulatedDriver): void {
    if (driver.status === 'offline') return;

    // Random movement direction
    const latChange = (Math.random() - 0.5) * 0.002; // ~200m
    const lngChange = (Math.random() - 0.5) * 0.002;

    driver.latitude += latChange;
    driver.longitude += lngChange;

    // Keep within Jakarta bounds
    driver.latitude = Math.max(JAKARTA_CENTER.lat - MOVEMENT_RANGE, Math.min(JAKARTA_CENTER.lat + MOVEMENT_RANGE, driver.latitude));
    driver.longitude = Math.max(JAKARTA_CENTER.lng - MOVEMENT_RANGE, Math.min(JAKARTA_CENTER.lng + MOVEMENT_RANGE, driver.longitude));

    // Update heading based on movement
    driver.heading = Math.atan2(lngChange, latChange) * (180 / Math.PI);
    if (driver.heading < 0) driver.heading += 360;

    // Random speed for busy drivers
    driver.speed = driver.status === 'busy' ? Math.floor(Math.random() * 40) + 10 : 0;
}

// Randomly change driver status
function randomlyChangeStatus(): void {
    const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
    if (randomDriver === undefined) return;
    
    const statuses: ('idle' | 'busy' | 'offline')[] = ['idle', 'busy', 'offline'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    if (newStatus !== undefined && newStatus !== randomDriver.status) {
        randomDriver.status = newStatus;
        console.log(`📍 ${randomDriver.name} status changed to: ${newStatus.toUpperCase()}`);
    }
}

// Send location update to server
async function sendLocationUpdate(driver: SimulatedDriver): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/api/drivers/${driver.id}/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: driver.latitude,
                longitude: driver.longitude,
                heading: driver.heading,
                speed: driver.speed,
                name: driver.name,
                status: driver.status
            })
        });

        if (!response.ok) {
            console.error(`Failed to update driver ${driver.id}:`, response.statusText);
        }
    } catch (error) {
        console.error(`Error sending update for driver ${driver.id}:`, error);
    }
}

// Main simulation loop
async function simulate(): Promise<void> {
    console.log('🚗 Starting Driver Simulator...');
    console.log(`📡 Sending updates to: ${API_URL}`);
    console.log('-----------------------------------');

    let iteration = 0;

    setInterval(async () => {
        iteration++;

        // Move all drivers
        for (const driver of drivers) {
            moveDriver(driver);
            await sendLocationUpdate(driver);
        }

        console.log(`[${new Date().toLocaleTimeString()}] Updated ${drivers.length} drivers`);

        // Randomly change status every 10 iterations (~20 seconds)
        if (iteration % 10 === 0) {
            randomlyChangeStatus();
        }
    }, 2000); // Update every 2 seconds
}

simulate();
