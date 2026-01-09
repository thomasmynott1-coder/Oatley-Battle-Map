# Oatley Campaign Battle Map

Operational battle map for the Oatley electorate campaign. Provides layer management, point tracking (door knocks, letterbox drops), and route planning with PDF export.

## Features

- **Map Visualization**: Google Maps Satellite view with Oatley electorate boundary overlay.
- **Layer Management**: Toggle layers for Door Knocking, Letterbox Drops, Events, Sentiment, and Signage.
- **Point Tracking**: Add, edit, and update status of points directly on the map.
- **Route Planning**: Create routes by selecting points or drawing paths, and export as PDF.
- **Data Ingestion**: Import points via CSV or GitHub raw URLs.
- **Real-time**: Updates sync across users via Supabase.

## Setup

### Prerequisites

### Environment Variables

The `.env.local` file has been configured with the provided keys.

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Installation

```bash
npm install
```

### Database Setup

Run the SQL migration in `supabase/migrations/20240101000000_init.sql` in your Supabase SQL Editor to create the necessary tables and types.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push code to GitHub.
2. Import project in Vercel.
3. Add Environment Variables in Vercel Project Settings.
4. Deploy.

## Data Import

- **GeoJSON**: Boundary is loaded from `/data/oatley.geojson`. Update this file in the repo to change the boundary.
- **CSV Import**: Use the Import button in the left panel. Expected columns: `lat`, `lng`. Optional: `status`, `notes`, `category`.

