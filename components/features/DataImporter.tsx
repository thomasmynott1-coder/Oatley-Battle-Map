'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayerKind } from '@/types/database';
import { supabase } from '@/utils/supabase/client';
import Papa from 'papaparse';

interface DataImporterProps {
    open: boolean;
    onClose: () => void;
}

export function DataImporter({ open, onClose }: DataImporterProps) {
    const [mode, setMode] = useState('csv');
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [targetLayer, setTargetLayer] = useState<LayerKind>('door_knock');
    const [loading, setLoading] = useState(false);
    const [statusArg, setStatusArg] = useState(''); // Default status

    const processData = async (data: any[]) => {
        // Map data to map_points schema
        const points = data.map((row: any) => {
            const lat = parseFloat(row.lat || row.latitude || row.Lat || row.Latitude);
            const lng = parseFloat(row.lng || row.long || row.longitude || row.Lng || row.Longitude);

            if (isNaN(lat) || isNaN(lng)) return null;

            return {
                layer_kind: row.layer_kind || targetLayer,
                lat,
                lng,
                status: row.status || (statusArg || null),
                category: row.category || row.event_type || row.sign_type || null,
                notes: row.notes || row.Notes || null,
                created_at: new Date().toISOString()
            };
        }).filter(p => p !== null);

        if (points.length === 0) {
            alert('No valid points found. Ensure CSV has lat/lng columns.');
            return;
        }

        const { error } = await supabase.from('map_points').insert(points);
        if (error) {
            console.error(error);
            alert(`Import failed: ${error.message}`);
        } else {
            alert(`Imported ${points.length} points successfully!`);
            onClose();
        }
    };

    const handleImport = async () => {
        setLoading(true);
        try {
            if (mode === 'csv') {
                if (!file) return alert('Please select a file');

                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async (results) => {
                        await processData(results.data);
                        setLoading(false);
                    },
                    error: (err) => {
                        console.error(err);
                        alert('CSV Parsing failed');
                        setLoading(false);
                    }
                });
            } else {
                // GitHub URL
                if (!url) return alert('Please enter a URL');

                // Fetch raw content
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch URL');

                // Provide simple extension check
                if (url.endsWith('.json') || url.endsWith('.geojson')) {
                    // GeoJSON not fully implemented for points yet, assumes CSV for points usually
                    // But if it's GeoJSON Points:
                    const json = await res.json();
                    if (json.type === 'FeatureCollection') {
                        const points = json.features.map((f: any) => {
                            if (f.geometry.type === 'Point') {
                                return {
                                    lat: f.geometry.coordinates[1],
                                    lng: f.geometry.coordinates[0],
                                    layer_kind: targetLayer,
                                    notes: f.properties.name || f.properties.description
                                }; // Mapped to our simple schema
                            }
                            return null;
                        }).filter((p: any) => p);
                        await processData(points);
                        setLoading(false);
                        return;
                    }
                }

                // Assume CSV text
                const text = await res.text();
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async (results) => {
                        await processData(results.data);
                        setLoading(false);
                    }
                });
            }
        } catch (e: any) {
            console.error(e);
            alert(`Import failed: ${e.message}`);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import Data</DialogTitle>
                </DialogHeader>

                <Tabs value={mode} onValueChange={setMode}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                        <TabsTrigger value="github">GitHub URL</TabsTrigger>
                    </TabsList>

                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Target Layer</Label>
                            <Select value={targetLayer} onValueChange={(v: any) => setTargetLayer(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="door_knock">Door Knocking</SelectItem>
                                    <SelectItem value="letterbox">Letterbox Drop</SelectItem>
                                    <SelectItem value="events">Events</SelectItem>
                                    <SelectItem value="sentiment">Sentiment</SelectItem>
                                    <SelectItem value="signage">Signage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Default Status (Optional)</Label>
                            <Input placeholder="e.g. to_knock" value={statusArg} onChange={e => setStatusArg(e.target.value)} />
                        </div>

                        <TabsContent value="csv" className="space-y-2">
                            <Label>CSV File</Label>
                            <Input type="file" accept=".csv" onChange={(e: any) => setFile(e.target.files?.[0] || null)} />
                            <p className="text-xs text-muted-foreground">Columns: lat, lng, [status], [notes], ...</p>
                        </TabsContent>

                        <TabsContent value="github" className="space-y-2">
                            <Label>Raw GitHub URL</Label>
                            <Input placeholder="https://raw.githubusercontent.com/..." value={url} onChange={e => setUrl(e.target.value)} />
                            <p className="text-xs text-muted-foreground">Supports CSV or GeoJSON Points</p>
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleImport} disabled={loading}>{loading ? 'Importing...' : 'Import'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
