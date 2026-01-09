'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayerPanel } from '@/components/layout/LayerPanel';
import { RoutePlanner } from '@/components/features/RoutePlanner';
import { DataImporter } from '@/components/features/DataImporter';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LeftPanel() {
    const [importOpen, setImportOpen] = React.useState(false);

    return (
        <div className="w-80 h-full bg-background border-r flex flex-col z-10 shadow-md">
            <div className="p-4 border-b flex justify-between items-center">
                <h1 className="text-xl font-bold">Oatley Battle Map</h1>
                <Button variant="ghost" size="icon" onClick={() => setImportOpen(true)} title="Import Data">
                    <Upload className="h-4 w-4" />
                </Button>
            </div>

            <DataImporter open={importOpen} onClose={() => setImportOpen(false)} />

            <Tabs defaultValue="layers" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 pt-2">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="layers">Map Layers</TabsTrigger>
                        <TabsTrigger value="routes">Routes</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="layers" className="flex-1 overflow-y-auto p-4">
                    <LayerPanel />
                </TabsContent>

                <TabsContent value="routes" className="flex-1 overflow-y-auto p-4">
                    <RoutePlanner />
                </TabsContent>
            </Tabs>
        </div>
    );
}
