# Database foundation

The production data model is PostgreSQL + PostGIS. The repository keeps SQL migrations vendor-neutral so the data layer is not coupled to an ORM or hosting provider before runtime persistence is required.

## Current status

- `migrations/0001_core.sql` defines the Phase 2 spatial/regulatory schema.
- No production database is connected yet.
- The live Austin beta currently queries official City GIS directly and does not persist property searches.
- Do not silently start storing searched addresses until privacy/retention behavior is implemented and documented.

## Migration protocol

1. Migrations are append-only once applied to a shared environment.
2. Never edit an already-applied migration to change production state; create a new numbered migration.
3. Every schema change must be reflected in `ARCHITECTURE.md` or `BUILD_STATE.md` when it changes the product contract.
4. Regulatory text is stored as versioned rule/source records, not as UI copy.
5. Spatial data must retain source/provenance metadata and fetched timestamps.
6. Geometry should use SRID 4326 at the application boundary. Provider-native coordinate systems may be retained in raw snapshots if needed.
7. Address search logs and saved-property behavior require an explicit privacy/retention decision before persistence.

## Initial entities

### Property intelligence
- `jurisdictions`
- `properties`
- `parcels`
- `zoning_districts`
- `spatial_layers`
- `spatial_features`
- `property_layer_matches`

### Evidence and rules
- `sources`
- `source_versions`
- `project_types`
- `rules`
- `rule_versions`
- `verification_events`

### Analysis snapshots
- `analyses`
- `analysis_checks`
- `analysis_evidence`

## Deployment gate

Before connecting the database to the public application:

- provision PostgreSQL with PostGIS enabled;
- apply migrations in a non-production environment first;
- run spatial query smoke tests;
- implement `DATABASE_URL` through environment configuration only;
- add application-side database access behind a small repository/service layer;
- define address-search retention and deletion behavior;
- add backups and restore verification;
- keep the direct City of Austin provider as an explicit source adapter rather than making the database the provenance source.
