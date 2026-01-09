'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Ban } from 'lucide-react';
import { useLayers } from '@/contexts/LayerContext';
import { LayerKind } from '@/types/database';
import { supabase } from '@/utils/supabase/client';

export function LayerPanel() {
    const { isLayerVisible, toggleLayer, activeLayer, setActiveLayer } = useLayers();
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchCounts = async () => {
            const newCounts: Record<string, number> = {};
            const kinds: LayerKind[] = ['door_knock', 'letterbox', 'events', 'sentiment', 'signage'];

            // Parallel fetch
            await Promise.all(kinds.map(async (kind) => {
                const { count } = await supabase.from('map_points').select('*', { count: 'exact', head: true }).eq('layer_kind', kind);
                newCounts[kind] = count || 0;
            }));

            setCounts(newCounts);
        };

        fetchCounts();

        // Subscription for counts
        const channel = supabase
            .channel('counts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'map_points' }, () => {
                fetchCounts();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const renderToggle = (kind: LayerKind, label: string) => {
        const isActive = activeLayer === kind;
        const count = counts[kind] || 0;

        return (
            <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                    <Switch
                        id={`layer-${kind}`}
                        checked={isLayerVisible(kind)}
                        onCheckedChange={() => toggleLayer(kind)}
                    />
                    <div className="flex flex-col">
                        <Label htmlFor={`layer-${kind}`} className="cursor-pointer">{label}</Label>
                        {kind !== 'boundary' && <span className="text-xs text-muted-foreground">{count} items</span>}
                    </div>
                </div>
                {kind !== 'boundary' && (
                    <Button
                        variant={isActive ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setActiveLayer(isActive ? null : kind)}
                        title={isActive ? "Cancel adding points" : "Add points to this layer"}
                    >
                        {isActive ? <Ban className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                    </Button>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="space-y-4">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-2 px-0 pt-0">
                        <CardTitle className="text-sm font-medium">Layers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-0">
                        {renderToggle('boundary', 'Electorate Boundary')}
                        {renderToggle('door_knock', 'Door Knocking')}
                        {renderToggle('letterbox', 'LetterBox Drop')}
                        {renderToggle('events', 'Events / Booths')}
                        {renderToggle('sentiment', 'Polling Sentiment')}
                        {renderToggle('signage', 'Signage')}
                    </CardContent>
                </Card>

                {activeLayer && (
                    <div className="bg-primary/10 text-primary p-3 rounded-md text-sm font-medium border border-primary/20">
                        Adding points to: <span className="uppercase">{activeLayer.replace('_', ' ')}</span>. Click on map to place.
                    </div>
                )}
            </div>
        </div>
    );
}
