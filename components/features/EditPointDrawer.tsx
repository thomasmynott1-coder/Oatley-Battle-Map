'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPoint } from '@/types/database';
import { supabase } from '@/utils/supabase/client';
import { Trash2 } from 'lucide-react';

interface EditPointDrawerProps {
    point: MapPoint | null;
    open: boolean;
    onClose: () => void;
}

export function EditPointDrawer({ point, open, onClose }: EditPointDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [category, setCategory] = useState<string>('');

    useEffect(() => {
        if (point) {
            setStatus(point.status || '');
            setNotes(point.notes || '');
            setCategory(point.category || point.sentiment || '');
        }
    }, [point]);

    if (!point) return null;

    const handleSave = async () => {
        setLoading(true);
        const updates: any = {
            notes: notes || null,
            updated_at: new Date().toISOString()
        };

        if (status) updates.status = status;
        if (category) {
            if (point.layer_kind === 'sentiment') updates.sentiment = category;
            else updates.category = category;
        }

        const { error } = await supabase.from('map_points').update(updates).eq('id', point.id);

        setLoading(false);
        if (error) {
            alert('Error updating point');
        } else {
            onClose();
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this point?')) return;
        setLoading(true);
        await supabase.from('map_points').delete().eq('id', point.id);
        setLoading(false);
        onClose();
    };

    const handleQuickAction = async (newStatus: string) => {
        await supabase.from('map_points').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', point.id);
        // Optimistic update handled by subscription or local state? Subscription handles it.
        // We close or stay open? Maybe stay open.
        setStatus(newStatus);
    };

    const renderFields = () => {
        // Similar to CreatePointDialog logic, but reuse simplified here
        return (
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Layer: {point.layer_kind}</Label>
                </div>

                {(point.layer_kind === 'door_knock' || point.layer_kind === 'letterbox' || point.layer_kind === 'signage') && (
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {point.layer_kind === 'door_knock' && (
                                    <>
                                        <SelectItem value="to_knock">To Knock</SelectItem>
                                        <SelectItem value="knocked">Knocked</SelectItem>
                                        <SelectItem value="follow_up">Follow Up</SelectItem>
                                    </>
                                )}
                                {point.layer_kind === 'letterbox' && (
                                    <>
                                        <SelectItem value="to_drop">To Drop</SelectItem>
                                        <SelectItem value="dropped">Dropped</SelectItem>
                                    </>
                                )}
                                {point.layer_kind === 'signage' && (
                                    <>
                                        <SelectItem value="planned">Planned</SelectItem>
                                        <SelectItem value="placed">Placed</SelectItem>
                                        <SelectItem value="removed">Removed</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                {/* Quick Actions */}
                {point.layer_kind === 'door_knock' && (
                    <Button variant="secondary" className="w-full" onClick={() => handleQuickAction('knocked')}>
                        Mark as Knocked
                    </Button>
                )}
                {point.layer_kind === 'letterbox' && (
                    <Button variant="secondary" className="w-full" onClick={() => handleQuickAction('dropped')}>
                        Mark as Dropped
                    </Button>
                )}
            </div>
        );
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Edit Point</SheetTitle>
                </SheetHeader>

                {renderFields()}

                <SheetFooter className="flex-col gap-2 sm:justify-between mt-4">
                    <div className="flex w-full justify-between">
                        <Button variant="destructive" size="icon" onClick={handleDelete} disabled={loading}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSave} disabled={loading}>Save</Button>
                        </div>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
