# Developer Utilities Reference

Quick reference for working with the persistence and migration framework.

## Import Statements

```typescript
// Migration & Validation
import { migrateSimulation, canonicalToLegacy, validateSimulation } from './utils/simulationMigration';

// Factory & Defaults
import { getDefaultSimulation, getSchemaChangelog } from './utils/simulationFactory';

// Persistence
import { persistenceService } from './services/persistenceAdapter';

// Report Building
import { buildReportPayload, getSimulationContextForExport } from './utils/reportBuilder';

// Types
import type { CanonicalSimulation, SimulationContext, SimulationSetup, SimulationWorkload, SimulationOperatingModel } from './types/canonicalSimulation';
```

## Quick Functions

### Create New Simulation

```typescript
import { getDefaultSimulation } from './utils/simulationFactory';

const newSim = getDefaultSimulation();
newSim.context.simulationName = 'My New Simulation';
newSim.context.planningType = 'new_function';
```

### Migrate Old Data

```typescript
import { migrateSimulation } from './utils/simulationMigration';

const oldData = { /* legacy format */ };
const canonical = migrateSimulation(oldData);
// Now safe to use
```

### Validate Before Save

```typescript
import { validateSimulation } from './utils/simulationMigration';

const { valid, warnings } = validateSimulation(simulation);
if (warnings.length > 0) {
  console.warn('Issues found:', warnings);
}
```

### Save Simulation

```typescript
import { persistenceService } from './services/persistenceAdapter';

const saved = await persistenceService.saveSimulation(simulation);
console.log('Saved with ID:', saved.id);
```

### Load & Auto-Migrate

```typescript
const simulation = await persistenceService.loadSimulation(id);
// Automatically migrated to latest schema
```

### List with Filters

```typescript
const results = await persistenceService.listSimulations({
  planningType: 'new_function',
  searchText: 'HR',
});
```

### Build Report Data

```typescript
import { buildReportPayload } from './utils/reportBuilder';

const reportData = buildReportPayload(simulation, results);
// Use for PDF/Word/Excel exports
```

### Get Schema Changelog

```typescript
import { getSchemaChangelog } from './utils/simulationFactory';

const changelog = getSchemaChangelog();
changelog.forEach(entry => {
  console.log(`${entry.version} (${entry.date}):`, entry.changes);
});
```

## Common Patterns

### Pattern: Loading Simulation in Component

```typescript
function MyComponent({ simulationId }: { simulationId: string }) {
  const [simulation, setSimulation] = useState<CanonicalSimulation | null>(null);

  useEffect(() => {
    async function load() {
      const data = await persistenceService.loadSimulation(simulationId);
      setSimulation(data);
    }
    load();
  }, [simulationId]);

  if (!simulation) return <div>Loading...</div>;

  return <div>{simulation.context.simulationName}</div>;
}
```

### Pattern: Saving from Wizard

```typescript
function SaveButton() {
  const { saveSimulation } = useWizard();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveSimulation();
      alert(`Saved successfully (ID: ${saved.id})`);
    } catch (error) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <button onClick={handleSave} disabled={saving}>
      {saving ? 'Saving...' : 'Save Simulation'}
    </button>
  );
}
```

### Pattern: Displaying Migration Status

```typescript
function SimulationInfo({ simulation }: { simulation: CanonicalSimulation }) {
  const isMigrated = simulation.legacy && Object.keys(simulation.legacy).length > 0;

  return (
    <div>
      <div>Schema: {simulation.schemaVersion}</div>
      {simulation.results && <div>Engine: {simulation.results.engineVersion}</div>}
      {isMigrated && (
        <div className="text-yellow-600">
          ⚠️ This simulation was migrated from an older version
        </div>
      )}
    </div>
  );
}
```

### Pattern: Exporting with Context

```typescript
import { getSimulationContextForExport } from './utils/reportBuilder';

function ExportButton({ simulation }: { simulation: CanonicalSimulation }) {
  const handleExport = () => {
    const context = getSimulationContextForExport(simulation);

    // Add to Excel/PDF/Word
    const rows = Object.entries(context).map(([key, value]) => [key, value]);
    // ... export logic
  };

  return <button onClick={handleExport}>Export</button>;
}
```

## Type Guards

### Check if Simulation has Results

```typescript
function hasResults(sim: CanonicalSimulation): sim is CanonicalSimulation & { results: NonNullable<CanonicalSimulation['results']> } {
  return !!sim.results && sim.results.scenarios.length > 0;
}

if (hasResults(simulation)) {
  console.log('Scenarios:', simulation.results.scenarios);
}
```

### Check Schema Version

```typescript
function isLatestSchema(sim: CanonicalSimulation): boolean {
  return sim.schemaVersion === CURRENT_SCHEMA_VERSION;
}
```

## Debugging

### Log Simulation Structure

```typescript
function debugSimulation(sim: CanonicalSimulation) {
  console.group('Simulation Debug');
  console.log('ID:', sim.id);
  console.log('Schema:', sim.schemaVersion);
  console.log('Name:', sim.context.simulationName);
  console.log('Planning Type:', sim.context.planningType);
  console.log('Has Results:', !!sim.results);
  console.log('Has Legacy Fields:', !!sim.legacy);
  if (sim.legacy) {
    console.log('Legacy Fields:', Object.keys(sim.legacy));
  }
  console.groupEnd();
}
```

### Validate and Report Issues

```typescript
import { validateSimulation } from './utils/simulationMigration';

function checkSimulation(sim: CanonicalSimulation) {
  const { valid, warnings } = validateSimulation(sim);

  if (!valid) {
    console.error('Simulation has issues:');
    warnings.forEach((warning, i) => {
      console.error(`  ${i + 1}. ${warning}`);
    });
  } else {
    console.log('✓ Simulation is valid');
  }

  return valid;
}
```

## Testing Migrations

### Test Migration Idempotency

```typescript
import { migrateSimulation } from './utils/simulationMigration';

function testMigrationIdempotency(rawData: any) {
  const first = migrateSimulation(rawData);
  const second = migrateSimulation(first);

  console.assert(
    JSON.stringify(first) === JSON.stringify(second),
    'Migration should be idempotent'
  );
}
```

### Test Backward Compatibility

```typescript
function testBackwardCompatibility() {
  const legacyData = {
    // Old format without entity, region, etc.
    simulation_name: 'Test',
    inputs: {
      planningType: 'new_function',
      operationSize: 'medium_standard',
    },
  };

  const migrated = migrateSimulation(legacyData);

  console.assert(migrated.schemaVersion === 'v1', 'Should migrate to v1');
  console.assert(migrated.context.entity === null, 'Should have null entity');
  console.assert(migrated.context.region === null, 'Should have null region');
  console.assert(migrated.context.autoSizeEnabled === true, 'Should default autoSize to true');

  console.log('✓ Backward compatibility test passed');
}
```

## Constants

```typescript
// Current versions
export const CURRENT_SCHEMA_VERSION = 'v1';
export const CURRENT_ENGINE_VERSION = '1.0.0';

// Default values
export const DEFAULT_AUTO_SIZE_ENABLED = true;
export const DEFAULT_OPERATION_SIZE = 'medium_standard';
export const DEFAULT_PLANNING_TYPE = 'new_project';
```

## Error Handling

```typescript
async function safeLoadSimulation(id: string): Promise<CanonicalSimulation | null> {
  try {
    const sim = await persistenceService.loadSimulation(id);
    if (!sim) {
      console.warn('Simulation not found:', id);
      return null;
    }

    const { valid, warnings } = validateSimulation(sim);
    if (!valid) {
      console.warn('Simulation has warnings:', warnings);
    }

    return sim;
  } catch (error) {
    console.error('Failed to load simulation:', error);
    return null;
  }
}
```

## Performance Tips

- Use `listSimulations()` with filters instead of loading all and filtering in JS
- Cache simulation metadata for library views (don't load full results)
- Only migrate when loading, not when listing
- Use the persistence adapter's built-in caching (Supabase/localStorage)

## Quick Checklist for Adding New Fields

- [ ] Update canonical type with optional field
- [ ] Add to migration function with safe default
- [ ] Update factory defaults
- [ ] Increment schema version if breaking
- [ ] Update changelog
- [ ] Add to report builder if needed
- [ ] Test with old data
- [ ] Update UI components
- [ ] Build and verify no errors
