'use client';

import React, { useState, useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useLayers } from '@/contexts/LayerContext';
import { useRoutes } from '@/contexts/RouteContext';
import { CreatePointDialog } from '@/components/features/CreatePointDialog';

export function MapEvents() {
    const map = useMap();
    const { activeLayer } = useLayers();
    const { isPlanning } = useRoutes();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newPoint, setNewPoint] = useState<google.maps.LatLngLiteral | null>(null);

    useEffect(() => {
        if (!map) return;

        const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
            // Only allow point creation if NOT in planning mode and we have an active layer
            if (!isPlanning && activeLayer && e.latLng) {
                setNewPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                setDialogOpen(true);
            }
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [map, activeLayer, isPlanning]);

    return (
        <CreatePointDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            latLng={newPoint}
            layerKind={activeLayer}
            onPointCreated={() => console.log('Point created!')}
        />
    );
}
