-- Create custom types
CREATE TYPE layer_kind AS ENUM ('boundary', 'door_knock', 'letterbox', 'events', 'sentiment', 'signage');

-- Create layers table
CREATE TABLE layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind layer_kind NOT NULL,
  visible BOOLEAN DEFAULT true,
  style JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create map_points table
CREATE TABLE map_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_kind layer_kind NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status TEXT, -- for door_knock ('to_knock', 'knocked', 'follow_up') / letterbox ('to_drop', 'dropped') / signage ('planned', 'placed', 'removed')
  category TEXT, -- event_type / sign_type
  confidence TEXT, -- sentiment only ('Low', 'Med', 'High')
  sentiment TEXT, -- sentiment value e.g. 'Strong support'
  notes TEXT,
  event_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  route_type TEXT NOT NULL CHECK (route_type IN ('door_knock', 'letterbox')),
  polyline TEXT,
  point_ids JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_map_points_layer_kind ON map_points(layer_kind);
CREATE INDEX idx_layers_kind ON layers(kind);
