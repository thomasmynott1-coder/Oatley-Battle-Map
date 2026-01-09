export type LayerKind = 'boundary' | 'door_knock' | 'letterbox' | 'events' | 'sentiment' | 'signage';

export interface Layer {
    id: string;
    name: string;
    kind: LayerKind;
    visible: boolean;
    style: any; // JSONB
    created_at: string;
}

export interface MapPoint {
    id: string;
    layer_kind: LayerKind;
    lat: number;
    lng: number;
    status?: 'to_knock' | 'knocked' | 'follow_up' | 'to_drop' | 'dropped' | 'planned' | 'placed' | 'removed' | null;
    category?: string | null;
    confidence?: 'Low' | 'Med' | 'High' | null;
    sentiment?: string | null;
    notes?: string | null;
    event_datetime?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Route {
    id: string;
    name: string;
    route_type: 'door_knock' | 'letterbox';
    polyline?: string | null;
    point_ids?: string[] | null;
    created_at: string;
}
