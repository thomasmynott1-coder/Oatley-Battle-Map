'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LayerKind } from '@/types/database';
import { supabase } from '@/utils/supabase/client';

interface CreatePointDialogProps {
    open: boolean;
    onClose: () => void;
    latLng: google.maps.LatLngLiteral | null;
    layerKind: LayerKind | null;
    onPointCreated?: () => void;
}

export function CreatePointDialog({ open, onClose, latLng, layerKind, onPointCreated }: CreatePointDialogProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    // Additional fields state
    const [category, setCategory] = useState<string>(''); // event_type / sign_type / sentiment

    if (!layerKind || !latLng) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const basePoint = {
            layer_kind: layerKind,
            lat: latLng.lat,
            lng: latLng.lng,
            notes: notes || null,
            created_at: new Date().toISOString()
        };

        // Enrich based on layer
        let pointData = { ...basePoint, status: status || null, category: category || null };

        // Layer specific logic defaults (simplified for MVP)
        if (layerKind === 'door_knock' && !status) pointData.status = 'to_knock';
        if (layerKind === 'letterbox' && !status) pointData.status = 'to_drop';

        const { error } = await supabase.from('map_points').insert([pointData]);

        setLoading(false);
        if (error) {
            console.error('Error creating point:', error);
            alert('Failed to save point');
        } else {
            onClose();
            // Reset fields
            setStatus('');
            setNotes('');
            setCategory('');
            if (onPointCreated) onPointCreated();
        }
    };

    const renderFields = () => {
        switch (layerKind) {
            case 'door_knock':
                return (
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="to_knock">To Knock</SelectItem>
                                <SelectItem value="knocked">Knocked</SelectItem>
                                <SelectItem value="follow_up">Follow Up</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'letterbox':
                return (
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="to_drop">To Drop</SelectItem>
                                <SelectItem value="dropped">Dropped</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'events':
                return (
                    <div className="space-y-2">
                        <Label>Event Type</Label>
                        <Input placeholder="Booth, Stand, etc." value={category} onChange={e => setCategory(e.target.value)} />
                    </div>
                );
            case 'sentiment':
                return (
                    <div className="space-y-2">
                        <Label>Sentiment</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger><SelectValue placeholder="Select support level" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Strong support">Strong support</SelectItem>
                                <SelectItem value="Lean support">Lean support</SelectItem>
                                <SelectItem value="Neutral">Neutral</SelectItem>
                                <SelectItem value="Lean against">Lean against</SelectItem>
                                <SelectItem value="Strong against">Strong against</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'signage':
                return (
                    <div className="space-y-2">
                        <Label>Sign Type</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="flute">Flute</SelectItem>
                                <SelectItem value="corflute">Corflute</SelectItem>
                                <SelectItem value="poster">Poster</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="pt-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">Planned</SelectItem>
                                    <SelectItem value="placed">Placed</SelectItem>
                                    <SelectItem value="removed">Removed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add {layerKind?.replace('_', ' ').toUpperCase()} Point</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderFields()}
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Point'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
