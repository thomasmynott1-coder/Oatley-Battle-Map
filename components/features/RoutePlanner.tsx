'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoutes } from '@/contexts/RouteContext';
import { generatePDF } from '@/utils/pdfExport'; // Will implement next

export function RoutePlanner() {
    const {
        isPlanning, setIsPlanning,
        routeType, setRouteType,
        routeName, setRouteName,
        selectedPointIds, drawnPath,
        saveRoute, resetRoute,
        clearPath, undoLastPathPoint
    } = useRoutes();

    const [loading, setLoading] = useState(false);

    const handleStart = () => setIsPlanning(true);
    const handleCancel = () => resetRoute();

    const handleSave = async () => {
        if (!routeName) return alert('Please enter a route name');
        setLoading(true);
        const route = await saveRoute();
        setLoading(false);
        if (route) {
            alert('Route saved!');
            // generate PDF?
            if (confirm('Download PDF now?')) {
                await generatePDF(route);
            }
            resetRoute();
        } else {
            alert('Failed to save');
        }
    };

    if (!isPlanning) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Route Planning</CardTitle>
                        <CardDescription>Create route plans for door knocking or letterbox drops.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={handleStart}>Create New Route</Button>
                    </CardContent>
                </Card>
                {/* Could list existing routes here */}
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            <h2 className="text-lg font-bold">New Route Plan</h2>

            <div className="space-y-2">
                <Label>Route Name</Label>
                <Input value={routeName} onChange={e => setRouteName(e.target.value)} placeholder="e.g. Mortdale West Drop" />
            </div>

            <div className="space-y-2">
                <Label>Type</Label>
                <Select value={routeType} onValueChange={(v: any) => setRouteType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="door_knock">Door Knock</SelectItem>
                        <SelectItem value="letterbox">Letterbox Drop</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-grow space-y-4 py-4 border-t border-b overflow-y-auto">
                <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                    <p><strong>Instructions:</strong></p>
                    <ul className="list-disc ml-4">
                        <li>Click points on map to select/deselect ({selectedPointIds.size} selected)</li>
                        <li>Click map background to draw path ({drawnPath.length} points)</li>
                    </ul>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={undoLastPathPoint} disabled={drawnPath.length === 0}>Undo Path</Button>
                    <Button variant="outline" size="sm" onClick={clearPath} disabled={drawnPath.length === 0}>Clear Path</Button>
                </div>
            </div>

            <div className="pb-4 space-y-2">
                <Button className="w-full" onClick={handleSave} disabled={loading}>Save & Download PDF</Button>
                <Button variant="ghost" className="w-full" onClick={handleCancel}>Cancel</Button>
            </div>
        </div>
    );
}
