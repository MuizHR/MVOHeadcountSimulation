# Persistence & Migration Framework

## Overview

The MVO & Headcount Simulator now includes a comprehensive persistence and migration framework that ensures backward compatibility when adding new fields or modifying the simulation data structure.

## Key Features

1. **Schema Versioning**: Every simulation is tagged with a `schemaVersion` (e.g., `v1`, `v2`)
2. **Engine Versioning**: Results include `engineVersion` to track which calculation engine produced them
3. **Canonical Data Model**: Single source of truth organized into logical sections
4. **Automatic Migration**: Old simulations are automatically migrated when loaded
5. **Non-Breaking Changes**: Missing fields default to safe values
6. **Persistence Adapter**: Supports both Supabase and localStorage with the same API

## Architecture

### Canonical Simulation Model

All simulations follow this structure:

```typescript
{
  id: string;
  schemaVersion: string;        // Current: "v1"

  context: {                     // Step 1: Planning Context
    simulationName: string;
    entity?: string | null;
    region?: string | null;
    planningType: PlanningType;
    operationSize: OperationSize;
    scopeDriverType?: ScopeDriverType;
    scopeDriverValue?: number;
    autoSizeEnabled?: boolean;
    contextObjectives?: string;
    // ... other context fields
  },

  setup: {                       // Step 2: Function Setup
    functionType: FunctionType;
    isCustomFunction?: boolean;
    customFunctionName?: string;
  },

  workload: {                    // Step 3: Workload & Drivers
    natureOfWork: WorkNature;
    workloadLevel: IntensityLevel;
    complexityLevel: IntensityLevel;
    automationPotential: number;
    // ... other workload fields
  },

  operatingModel: {              // Step 4: Operating Model
    workforceMix: WorkforceMix;
  },

  results?: {                    // Step 6: Results
    engineVersion: string;
    scenarios: any[];
    selectedScenario?: any;
    calculatedAt: string;
  },

  createdAt?: string;
  updatedAt?: string;
  legacy?: Record<string, any>; // Preserves unknown fields from old versions
}
```

### Migration Pipeline

When a simulation is loaded:

1. **Detection**: Check if `schemaVersion` exists
2. **Classification**: Determine source version (v0 for legacy, v1 for current)
3. **Migration**: Apply appropriate transformations
4. **Validation**: Check for warnings (non-blocking)
5. **Usage**: Return canonical format to application

```typescript
import { migrateSimulation } from './utils/simulationMigration';

const rawSimulation = await loadFromDatabase();
const canonical = migrateSimulation(rawSimulation);
// canonical is now safe to use
```

## Developer Guide

### Adding New Fields (Schema Changes)

When you need to add a new field:

1. **Update the canonical type** in `src/types/canonicalSimulation.ts`:

```typescript
export interface SimulationContext {
  // ... existing fields
  newField?: string | null;  // Always optional with safe default
}
```

2. **Update CURRENT_SCHEMA_VERSION** if this is a breaking change:

```typescript
export const CURRENT_SCHEMA_VERSION = 'v2';
```

3. **Update SCHEMA_CHANGELOG**:

```typescript
export const SCHEMA_CHANGELOG: SchemaChangelogEntry[] = [
  {
    version: 'v2',
    date: '2025-12-15',
    changes: [
      'Added newField to context for tracking X',
    ],
  },
  // ... previous versions
];
```

4. **Update migration function** in `src/utils/simulationMigration.ts`:

```typescript
function migrateFromLegacy(raw: any): CanonicalSimulation {
  // ... existing code

  const context: SimulationContext = {
    // ... existing fields
    newField: inputs.newField || inputs.new_field || null,  // Handle both camelCase and snake_case
  };

  // ... rest of migration
}
```

5. **Update default factory** in `src/utils/simulationFactory.ts`:

```typescript
export function getDefaultContext(): SimulationContext {
  return {
    // ... existing fields
    newField: null,
  };
}
```

6. **Update UI components** to use the new field from `simulation.context.newField`

### Using the Persistence Service

#### Save a Simulation

```typescript
import { persistenceService } from './services/persistenceAdapter';

// In WizardContext, this is done automatically via saveSimulation()
const saved = await persistenceService.saveSimulation(canonicalSimulation);
console.log('Saved with ID:', saved.id);
```

#### Load a Simulation

```typescript
const simulation = await persistenceService.loadSimulation(simulationId);
if (simulation) {
  // Simulation is already migrated to canonical format
  console.log(simulation.context.simulationName);
}
```

#### List Simulations with Filters

```typescript
const simulations = await persistenceService.listSimulations({
  entity: 'ACME Corp',
  planningType: 'new_function',
  operationSize: 'medium_standard',
  searchText: 'Q4 planning',
});
```

#### Duplicate a Simulation

```typescript
const duplicate = await persistenceService.duplicateSimulation(
  originalId,
  'Q4 Planning (Copy)'
);
```

#### Delete a Simulation

```typescript
await persistenceService.deleteSimulation(simulationId);
```

### Using WizardContext Methods

The WizardContext now provides persistence methods:

```typescript
import { useWizard } from './contexts/WizardContext';

function MyComponent() {
  const { saveSimulation, loadSimulationById } = useWizard();

  const handleSave = async () => {
    try {
      const saved = await saveSimulation();
      alert(`Saved as ${saved.id}`);
    } catch (error) {
      alert('Failed to save');
    }
  };

  const handleLoad = async (id: string) => {
    const success = await loadSimulationById(id);
    if (success) {
      alert('Loaded successfully');
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Save</button>
      {/* ... */}
    </div>
  );
}
```

### Validation (Non-Blocking)

Validate a simulation before displaying warnings:

```typescript
import { validateSimulation } from './utils/simulationMigration';

const { valid, warnings } = validateSimulation(canonical);

if (!valid) {
  console.warn('Simulation has issues:', warnings);
  // Show warnings to user but don't block usage
}
```

### Report Generation

Use the report builder for consistent exports:

```typescript
import { buildReportPayload } from './utils/reportBuilder';

const reportData = buildReportPayload(simulation, results);

// Now use reportData for PDF/Word/Excel/Email exports
```

## Migration Examples

### Example 1: Legacy Simulation (no schema version)

**Input:**
```json
{
  "id": "abc123",
  "simulation_name": "Old Simulation",
  "inputs": {
    "planningType": "new_function",
    "operationSize": "medium_standard"
  },
  "scenarios": [...]
}
```

**After Migration:**
```json
{
  "id": "abc123",
  "schemaVersion": "v1",
  "context": {
    "simulationName": "Old Simulation",
    "planningType": "new_function",
    "operationSize": "medium_standard",
    "entity": null,              // ← Added with safe default
    "region": null,              // ← Added with safe default
    "autoSizeEnabled": true      // ← Added with safe default
  },
  "setup": { ... },
  "workload": { ... },
  "operatingModel": { ... },
  "results": { ... }
}
```

### Example 2: Current Simulation (v1)

**Input:**
```json
{
  "id": "def456",
  "schemaVersion": "v1",
  "context": {
    "simulationName": "Q4 Planning",
    "entity": "ACME Corp",
    "region": "North America",
    "autoSizeEnabled": false
  },
  ...
}
```

**After Migration:**
```json
// No changes - already in canonical format
{
  "id": "def456",
  "schemaVersion": "v1",
  "context": {
    "simulationName": "Q4 Planning",
    "entity": "ACME Corp",
    "region": "North America",
    "autoSizeEnabled": false
  },
  ...
}
```

## Database Schema

### Simulations Table

```sql
CREATE TABLE simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  simulation_name text NOT NULL,
  inputs jsonb NOT NULL,           -- Flattened canonical structure
  scenarios jsonb NOT NULL,        -- Results array
  selected_scenario_type text,
  schema_version text DEFAULT 'v1',
  engine_version text DEFAULT '1.0.0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Best Practices

### DO ✅

- Always make new fields optional with safe defaults
- Update SCHEMA_CHANGELOG when making changes
- Test migration with old data before deploying
- Use `validateSimulation()` to catch issues early
- Keep migrations idempotent (running twice = same result)

### DON'T ❌

- Don't remove required fields without migration path
- Don't change field types without handling old values
- Don't block loading if new fields are missing
- Don't assume all simulations have latest fields
- Don't forget to update both camelCase and snake_case in migrations

## Troubleshooting

### Issue: Old simulation won't load

**Check:**
1. Does migration handle missing fields with defaults?
2. Are both camelCase and snake_case variants handled?
3. Is the field marked as optional in canonical type?

### Issue: New field not showing in UI

**Check:**
1. Did you update the canonical type definition?
2. Did you add it to the migration function?
3. Did you update the default factory?
4. Is the UI component reading from `simulation.context.newField`?

### Issue: Export missing new fields for old simulations

**Check:**
1. Does `buildReportPayload()` handle null/undefined gracefully?
2. Are you showing "Not specified" for missing fields?
3. Is the export reading from the migrated canonical structure?

## Acceptance Criteria ✓

- [x] Existing saved simulations open without errors
- [x] Step 1-4 fields prefill correctly after migration
- [x] Step 5 reads directly from migrated simulation
- [x] Step 6 reads from results + simulation.context
- [x] Simulation Library shows consistent metadata
- [x] Exports work for both old and new simulations
- [x] Missing fields show "Not specified" in exports
- [x] Schema versioning tracks changes over time
- [x] Migration is idempotent and non-destructive
- [x] Persistence works with both Supabase and localStorage

## Schema Versions

### v0 (Legacy)
- Original flat structure
- No schema versioning
- Direct storage of SimulationInputs

### v1 (Current)
- Canonical structure with context/setup/workload/operatingModel
- Schema and engine versioning
- Added: entity, region, scopeDriverType, scopeDriverValue, autoSizeEnabled
- Migration from v0 applies safe defaults for all new fields

### Future Versions
Add entries here as schema evolves...

## Support

For questions or issues with the migration framework, refer to:
- `src/types/canonicalSimulation.ts` - Type definitions
- `src/utils/simulationMigration.ts` - Migration logic
- `src/services/persistenceAdapter.ts` - Persistence implementation
- `src/utils/simulationFactory.ts` - Default values
- `src/utils/reportBuilder.ts` - Report generation
