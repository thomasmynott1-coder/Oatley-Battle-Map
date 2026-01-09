'use client';

import React, { useEffect } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { useLayers } from '@/contexts/LayerContext';

interface MapComponentProps {
    className?: string;
    children?: React.ReactNode;
}

const OATLEY_BOUNDS = {
    north: -33.950,
    south: -34.000,
    west: 151.050,
    east: 151.100
};

export function MapComponent({ className }: MapComponentProps) {
    const map = useMap();
    const { isLayerVisible } = useLayers();
    const showBoundary = isLayerVisible('boundary');

    useEffect(() => {
        if (!map) return;

        // Load Oatley boundary
        map.data.loadGeoJson('/data/oatley.geojson');

        // Initial style
        map.data.setStyle({
            fillColor: 'transparent',
            strokeColor: '#3b82f6',
            strokeWeight: 2,
        });

        return () => {
            // Cleanup: remove all features from data layer on unmount
            map.data.forEach((feature) => {
                map.data.remove(feature);
            });
        };
    }, [map]);

    useEffect(() => {
        if (!map) return;

        map.data.setStyle((feature) => {
            return {
                visible: showBoundary,
                fillColor: 'rgba(59, 130, 246, 0.1)',
                strokeColor: '#3b82f6',
                strokeWeight: 2,
                clickable: false
            };
        });

    }, [map, showBoundary]);

    return (
        <Map
            defaultCenter={{ lat: -33.97, lng: 151.07 }}
            defaultZoom={13}
            mapId="oatley-battle-map"
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            mapTypeId={'satellite'}
            className={className}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </Map>
    );
}
