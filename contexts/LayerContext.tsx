'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LayerKind } from '@/types/database';

interface LayerState {
    [key: string]: boolean;
}

interface LayerContextType {
    layerVisibility: LayerState;
    activeLayer: LayerKind | null;
    toggleLayer: (kind: LayerKind) => void;
    isLayerVisible: (kind: LayerKind) => boolean;
    setActiveLayer: (kind: LayerKind | null) => void;
}

const defaultVisibility: LayerState = {
    boundary: true,
    door_knock: false,
    letterbox: false,
    events: false,
    sentiment: false,
    signage: false,
};

const LayerContext = createContext<LayerContextType | undefined>(undefined);

export function LayerProvider({ children }: { children: ReactNode }) {
    const [layerVisibility, setLayerVisibility] = useState<LayerState>(defaultVisibility);
    const [activeLayer, setActiveLayer] = useState<LayerKind | null>(null);

    const toggleLayer = (kind: LayerKind) => {
        setLayerVisibility((prev) => ({
            ...prev,
            [kind]: !prev[kind],
        }));
    };

    const isLayerVisible = (kind: LayerKind) => !!layerVisibility[kind];

    return (
        <LayerContext.Provider value={{ layerVisibility, toggleLayer, isLayerVisible, activeLayer, setActiveLayer }}>
            {children}
        </LayerContext.Provider>
    );
}

export function useLayers() {
    const context = useContext(LayerContext);
    if (context === undefined) {
        throw new Error('useLayers must be used within a LayerProvider');
    }
    return context;
}
