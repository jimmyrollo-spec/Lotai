BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE jurisdictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_key text NOT NULL UNIQUE,
  country_code text NOT NULL DEFAULT 'US',
  state_code text,
  name text NOT NULL,
  jurisdiction_type text NOT NULL,
  parent_jurisdiction_id uuid REFERENCES jurisdictions(id),
  external_ids jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid REFERENCES jurisdictions(id),
  source_key text NOT NULL UNIQUE,
  title text NOT NULL,
  authority text NOT NULL,
  source_class text NOT NULL,
  canonical_url text NOT NULL,
  terms_url text,
  license_notes text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE source_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  effective_date date,
  superseded_date date,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  content_hash text,
  locator text,
  snapshot_uri text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (source_id, content_hash)
);

CREATE TABLE parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid REFERENCES jurisdictions(id),
  source_id uuid REFERENCES sources(id),
  provider_key text NOT NULL,
  parcel_identifier text,
  external_property_identifier text,
  geometry geometry(MultiPolygon, 4326) NOT NULL,
  centroid geometry(Point, 4326) GENERATED ALWAYS AS (ST_PointOnSurface(geometry)) STORED,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_fetched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_key, parcel_identifier)
);

CREATE INDEX parcels_geometry_gix ON parcels USING gist (geometry);
CREATE INDEX parcels_centroid_gix ON parcels USING gist (centroid);
CREATE INDEX parcels_jurisdiction_idx ON parcels (jurisdiction_id);

CREATE TABLE zoning_districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id),
  source_id uuid REFERENCES sources(id),
  zoning_code text NOT NULL,
  base_district text,
  label text,
  geometry geometry(MultiPolygon, 4326),
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_fetched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX zoning_geometry_gix ON zoning_districts USING gist (geometry);
CREATE INDEX zoning_lookup_idx ON zoning_districts (jurisdiction_id, zoning_code);

CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_address text NOT NULL,
  display_address text NOT NULL,
  longitude double precision NOT NULL,
  latitude double precision NOT NULL,
  location geometry(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
  address_provider text,
  provider_match_score numeric(5,2),
  jurisdiction_id uuid REFERENCES jurisdictions(id),
  parcel_id uuid REFERENCES parcels(id),
  zoning_district_id uuid REFERENCES zoning_districts(id),
  external_ids jsonb NOT NULL DEFAULT '{}'::jsonb,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX properties_location_gix ON properties USING gist (location);
CREATE INDEX properties_address_idx ON properties (normalized_address);
CREATE INDEX properties_parcel_idx ON properties (parcel_id);

CREATE TABLE spatial_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid REFERENCES jurisdictions(id),
  source_id uuid REFERENCES sources(id),
  layer_key text NOT NULL UNIQUE,
  name text NOT NULL,
  layer_kind text NOT NULL,
  geometry_type text NOT NULL,
  confidence_class text NOT NULL DEFAULT 'authoritative_mapped',
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE spatial_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id uuid NOT NULL REFERENCES spatial_layers(id) ON DELETE CASCADE,
  external_feature_id text,
  geometry geometry(Geometry, 4326) NOT NULL,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_fetched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (layer_id, external_feature_id)
);

CREATE INDEX spatial_features_geometry_gix ON spatial_features USING gist (geometry);
CREATE INDEX spatial_features_layer_idx ON spatial_features (layer_id);

CREATE TABLE property_layer_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  spatial_feature_id uuid NOT NULL REFERENCES spatial_features(id) ON DELETE CASCADE,
  relation text NOT NULL,
  overlap_area_sq_ft numeric,
  distance_ft numeric,
  derived_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (property_id, spatial_feature_id, relation)
);

CREATE TABLE project_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_key text NOT NULL UNIQUE,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  input_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id),
  project_type_id uuid NOT NULL REFERENCES project_types(id),
  rule_key text NOT NULL,
  category text NOT NULL,
  label text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (jurisdiction_id, project_type_id, rule_key)
);

CREATE TABLE rule_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  source_version_id uuid REFERENCES source_versions(id),
  version_number integer NOT NULL,
  explanation text NOT NULL,
  normalized_value jsonb,
  applicability jsonb NOT NULL DEFAULT '{}'::jsonb,
  exceptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  unresolved jsonb NOT NULL DEFAULT '[]'::jsonb,
  automation_status text NOT NULL,
  confidence text NOT NULL,
  effective_date date,
  superseded_date date,
  verified_at timestamptz,
  verification_method text,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rule_id, version_number)
);

CREATE INDEX rule_versions_applicability_gin ON rule_versions USING gin (applicability);

CREATE TABLE verification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_version_id uuid REFERENCES source_versions(id),
  rule_version_id uuid REFERENCES rule_versions(id),
  event_type text NOT NULL,
  status text NOT NULL,
  verifier text,
  notes text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (source_version_id IS NOT NULL OR rule_version_id IS NOT NULL)
);

CREATE TABLE analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id),
  project_type_id uuid NOT NULL REFERENCES project_types(id),
  project_inputs jsonb NOT NULL,
  analysis_status text NOT NULL,
  feasibility_status text,
  confidence text,
  confidence_score numeric(5,2),
  unresolved jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  engine_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX analyses_property_idx ON analyses (property_id, created_at DESC);

CREATE TABLE analysis_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  rule_version_id uuid REFERENCES rule_versions(id),
  check_key text NOT NULL,
  status text NOT NULL,
  result_value jsonb,
  explanation text NOT NULL,
  confidence text NOT NULL,
  unresolved jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (analysis_id, check_key)
);

CREATE TABLE analysis_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_check_id uuid NOT NULL REFERENCES analysis_checks(id) ON DELETE CASCADE,
  source_version_id uuid REFERENCES source_versions(id),
  evidence_type text NOT NULL,
  locator text,
  excerpt_hash text,
  evidence_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO project_types (project_key, name, input_schema)
VALUES
  ('detached_garage', 'Detached garage / workshop', '{"required":["widthFt","depthFt"],"optional":["heightFt","stories","placement","plumbing"]}'::jsonb),
  ('deck', 'Deck', '{}'::jsonb),
  ('shed', 'Shed / accessory structure', '{}'::jsonb),
  ('pool', 'Pool', '{}'::jsonb),
  ('home_addition', 'Home addition', '{}'::jsonb)
ON CONFLICT (project_key) DO NOTHING;

COMMIT;
