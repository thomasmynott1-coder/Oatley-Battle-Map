'use client';

import React, { useEffect } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useRoutes } from '@/contexts/RouteContext';

export function MapRoutes() {
    const map = useMap();
    const mapsLib = useMapsLibrary('maps');
    const { isPlanning, drawnPath, addPathPoint } = useRoutes();
    const [polyline, setPolyline] = React.useState<google.maps.Polyline | null>(null);

    // Initial Polyline
    useEffect(() => {
        if (!map || !mapsLib) return;

        const line = new mapsLib.Polyline({
            path: drawnPath,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: map,
            clickable: false
        });

        setPolyline(line);

        return () => {
            line.setMap(null);
        };
    }, [map, mapsLib]);

    // Update Path
    useEffect(() => {
        if (polyline) {
            polyline.setPath(drawnPath);
        }
    }, [drawnPath, polyline]);

    // Handle Click for drawing
    useEffect(() => {
        if (!map || !isPlanning) return;

        const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                addPathPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [map, isPlanning, addPathPoint]);

    return null; // Renders nothing via React, uses Google Maps instance
}
