'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map to avoid SSR issues with Leaflet
const LiveTrackingMap = dynamic(
    () => import('../components/LiveTrackingMap'),
    { 
        ssr: false,
        loading: () => (
            <div className="w-full h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading Dashboard...</p>
                </div>
            </div>
        )
    }
);

export default function DashboardPage() {
    return (
        <main className="h-screen w-screen overflow-hidden bg-gray-900">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-[1001] bg-gradient-to-b from-gray-900 to-transparent">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                🚚 FleetCommand
                            </h1>
                            <p className="text-gray-400 text-sm">Live Tracking Dashboard</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Full-screen Map */}
            <div className="h-full w-full pt-16">
                <LiveTrackingMap />
            </div>
        </main>
    );
}
