'use client';

import React, { useEffect, useState } from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useLayers } from '@/contexts/LayerContext';
import { useRoutes } from '@/contexts/RouteContext';
import { supabase } from '@/utils/supabase/client';
import { MapPoint } from '@/types/database';
import { EditPointDrawer } from '@/components/features/EditPointDrawer';

export function MapPoints() {
    const { isLayerVisible } = useLayers();
    const { isPlanning, selectedPointIds, togglePointSelection } = useRoutes();
    const [points, setPoints] = useState<MapPoint[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

    useEffect(() => {
        const fetchPoints = async () => {
            const { data, error } = await supabase.from('map_points').select('*');
            if (!error && data) {
                setPoints(data as MapPoint[]);
            }
        };

        fetchPoints();

        const channel = supabase
            .channel('map_points_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'map_points' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setPoints(prev => [...prev, payload.new as MapPoint]);
                } else if (payload.eventType === 'UPDATE') {
                    setPoints(prev => prev.map(p => p.id === payload.new.id ? payload.new as MapPoint : p));
                } else if (payload.eventType === 'DELETE') {
                    setPoints(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const visiblePoints = points.filter(p => isLayerVisible(p.layer_kind));

    const handleClick = (point: MapPoint) => {
        if (isPlanning) {
            togglePointSelection(point.id);
        } else {
            setSelectedPoint(point);
        }
    };

    const getPinColor = (p: MapPoint) => {
        if (isPlanning && selectedPointIds.has(p.id)) return '#2563eb'; // Blue selected

        switch (p.layer_kind) {
            case 'door_knock': return '#22c55e';
            case 'letterbox': return '#eab308';
            case 'events': return '#ec4899';
            case 'sentiment': return '#8b5cf6';
            case 'signage': return '#f97316';
            default: return '#ef4444';
        }
    };

    return (
        <>
            {visiblePoints.map(point => (
                <AdvancedMarker
                    key={point.id}
                    position={{ lat: point.lat, lng: point.lng }}
                    onClick={() => handleClick(point)}
                    zIndex={isPlanning && selectedPointIds.has(point.id) ? 100 : 1}
                >
                    <Pin
                        background={getPinColor(point)}
                        glyphColor={'#fff'}
                        borderColor={isPlanning && selectedPointIds.has(point.id) ? '#fff' : '#000'}
                        scale={isPlanning && selectedPointIds.has(point.id) ? 1.2 : 1.0}
                    />
                </AdvancedMarker>
            ))}

            <EditPointDrawer
                point={selectedPoint}
                open={!!selectedPoint}
                onClose={() => setSelectedPoint(null)}
            />
        </>
    );
}
