import type { StudyKind } from "@/components/art/Study";

/** Collective Professional Experience — the seven neutral, unattributed studies (no individual, client or project attribution). */
export const STUDIES: { kind: StudyKind; label: string }[] = [
  { kind: "masterplan", label: "Masterplan framework" },
  { kind: "gis", label: "GIS suitability" },
  { kind: "regional", label: "Regional structure" },
  { kind: "mobility", label: "Mobility network" },
  { kind: "intensity", label: "Development intensity" },
  { kind: "bluegreen", label: "Blue-green system" },
  { kind: "process", label: "Feasibility and process" },
];
