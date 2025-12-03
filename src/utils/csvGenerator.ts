export function generateCSV(simulation: any): void {
  try {
    const rows: string[][] = [];

    // Header
    rows.push(['Simulation Report']);
    rows.push([]);

    // Basic Info
    rows.push(['Simulation Name', simulation.simulation_name]);
    rows.push(['Created Date', new Date(simulation.created_at).toLocaleString()]);
    rows.push(['Last Updated', new Date(simulation.updated_at).toLocaleString()]);
    rows.push([]);

    // Planning Context
    if (simulation.inputs?.planningContext) {
      const pc = simulation.inputs.planningContext;
      rows.push(['Planning Context']);
      rows.push(['Function Name', pc.functionName || 'N/A']);
      rows.push(['Planning Horizon', pc.planningHorizon || 'N/A']);
      rows.push(['Headcount Target', pc.headcountTarget?.toString() || 'N/A']);
      rows.push(['Geographic Scope', pc.geographicScope || 'N/A']);
      rows.push([]);
    }

    // Sub-functions
    if (simulation.inputs?.subFunctions && simulation.inputs.subFunctions.length > 0) {
      rows.push(['Sub-Functions']);
      rows.push(['Name', 'Workload Driver', 'Current Volume', 'Target Volume']);

      simulation.inputs.subFunctions.forEach((sf: any) => {
        rows.push([
          sf.name || 'N/A',
          sf.workloadDriver || 'N/A',
          sf.currentVolume?.toString() || 'N/A',
          sf.targetVolume?.toString() || 'N/A'
        ]);
      });
      rows.push([]);
    }

    // Selected Scenario Results
    if (simulation.scenarios && simulation.selected_scenario_type) {
      const scenario = simulation.scenarios[simulation.selected_scenario_type];
      if (scenario) {
        rows.push(['Selected Scenario: ' + simulation.selected_scenario_type]);
        rows.push(['Total FTE', scenario.totalFte?.toFixed(2) || 'N/A']);
        rows.push(['Total Cost', scenario.totalCost ? `$${scenario.totalCost.toLocaleString()}` : 'N/A']);
        rows.push([]);

        if (scenario.roleBreakdown && scenario.roleBreakdown.length > 0) {
          rows.push(['Role Breakdown']);
          rows.push(['Role', 'FTE', 'Cost']);

          scenario.roleBreakdown.forEach((role: any) => {
            rows.push([
              role.role || 'N/A',
              role.fte?.toFixed(2) || 'N/A',
              role.cost ? `$${role.cost.toLocaleString()}` : 'N/A'
            ]);
          });
        }
      }
    }

    // Convert to CSV string
    const csvContent = rows.map(row =>
      row.map(cell => {
        const cellStr = cell?.toString() || '';
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
}
