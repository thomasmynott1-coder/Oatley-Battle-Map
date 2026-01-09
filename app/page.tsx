'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { MapComponent } from '@/components/map/MapComponent';
import { LeftPanel } from '@/components/layout/LeftPanel';
import { LayerProvider } from '@/contexts/LayerContext';
import { RouteProvider } from '@/contexts/RouteContext';
import { MapEvents } from '@/components/map/MapEvents';
import { MapPoints } from '@/components/map/MapPoints';
import { MapRoutes } from '@/components/map/MapRoutes';

export default function Home() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    if (!apiKey) {
        return (
            <div className="flex items-center justify-center h-screen bg-destructive/10 text-destructive font-bold">
                Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey}>
            <LayerProvider>
                <RouteProvider>
                    <main className="flex h-screen w-full overflow-hidden">
                        {/* Left Panel */}
                        <div className="flex-none z-20">
                            <LeftPanel />
                        </div>

                        {/* Map Viewport */}
                        <div className="flex-grow relative">
                            <MapComponent className="w-full h-full">
                                <MapEvents />
                                <MapPoints />
                                <MapRoutes />
                            </MapComponent>
                        </div>
                    </main>
                </RouteProvider>
            </LayerProvider>
        </APIProvider>
    );
}
