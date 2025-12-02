export const ROLE_MAP: Record<string, string> = {
  "Senior Chief Officer": "senior_chief_officer",
  "Chief Officer": "chief_officer",
  "General Manager": "general_manager",
  "Senior General Manager": "general_manager",
  "General Manager / Senior General Manager": "general_manager",
  "Deputy General Manager": "deputy_general_manager",
  "Senior Manager": "senior_manager",
  "Manager": "manager",
  "Deputy Manager": "deputy_manager",
  "Senior Executive": "senior_executive",
  "Executive": "executive",
  "Executive-B": "executive_b",
  "Senior Clerical / Technician / Secretary": "senior_clerical",
  "Clerk / Technician": "clerk",
  "Office Assistant / General Worker": "office_assistant"
};

export function getRoleBandKey(roleLabel: string): string {
  const cleanLabel = roleLabel.replace(/\s*\((Permanent|GIG)\)\s*/gi, '').trim();
  return ROLE_MAP[cleanLabel] || cleanLabel.toLowerCase().replace(/\s+/g, '_');
}

export function getWorkerTypeFromLabel(roleLabel: string): "permanent" | "gig" {
  if (roleLabel.includes("(GIG)")) return "gig";
  if (roleLabel.includes("(Permanent)")) return "permanent";
  return "permanent";
}
