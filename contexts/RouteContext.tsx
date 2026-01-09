'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Route } from '@/types/database';

interface RouteContextType {
    isPlanning: boolean;
    setIsPlanning: (v: boolean) => void;
    routeType: 'door_knock' | 'letterbox';
    setRouteType: (v: 'door_knock' | 'letterbox') => void;
    routeName: string;
    setRouteName: (v: string) => void;

    selectedPointIds: Set<string>;
    togglePointSelection: (id: string) => void;

    drawnPath: google.maps.LatLngLiteral[];
    addPathPoint: (pt: google.maps.LatLngLiteral) => void;
    clearPath: () => void;
    undoLastPathPoint: () => void;

    saveRoute: () => Promise<Route | null>;
    resetRoute: () => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
    const [isPlanning, setIsPlanning] = useState(false);
    const [routeType, setRouteType] = useState<'door_knock' | 'letterbox'>('door_knock');
    const [routeName, setRouteName] = useState('');
    const [selectedPointIds, setSelectedPointIds] = useState<Set<string>>(new Set());
    const [drawnPath, setDrawnPath] = useState<google.maps.LatLngLiteral[]>([]);

    const togglePointSelection = (id: string) => {
        const newSet = new Set(selectedPointIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedPointIds(newSet);
    };

    const addPathPoint = (pt: google.maps.LatLngLiteral) => {
        setDrawnPath(prev => [...prev, pt]);
    };

    const clearPath = () => setDrawnPath([]);
    const undoLastPathPoint = () => setDrawnPath(prev => prev.slice(0, -1));

    const resetRoute = () => {
        setIsPlanning(false);
        setRouteName('');
        setSelectedPointIds(new Set());
        setDrawnPath([]);
    };

    const saveRoute = async () => {
        if (!routeName) return null;

        const routeData = {
            name: routeName,
            route_type: routeType,
            point_ids: Array.from(selectedPointIds),
            polyline: JSON.stringify(drawnPath), // Simple JSON storage for now
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('routes').insert([routeData]).select().single();

        if (error) {
            console.error('Error saving route', error);
            return null;
        }
        return data as Route;
    };

    return (
        <RouteContext.Provider value={{
            isPlanning, setIsPlanning,
            routeType, setRouteType,
            routeName, setRouteName,
            selectedPointIds, togglePointSelection,
            drawnPath, addPathPoint, clearPath, undoLastPathPoint,
            saveRoute, resetRoute
        }}>
            {children}
        </RouteContext.Provider>
    );
}

export function useRoutes() {
    const context = useContext(RouteContext);
    if (context === undefined) {
        throw new Error('useRoutes must be used within a RouteProvider');
    }
    return context;
}
