/** Home interactive copy. Lens captions = PDF practice taglines; reading captions are generic, non-factual design copy. */

export const READINGS = [
  { id: "terrain", label: "Terrain", index: "01 / 06", title: "TERRAIN", copy: "Topography establishes where water moves, land holds and routes can sit." },
  { id: "movement", label: "Movement", index: "02 / 06", title: "MOVEMENT", copy: "Road hierarchy reveals how access and connectivity structure the site." },
  { id: "water", label: "Water", index: "03 / 06", title: "WATER", copy: "Blue-green systems make resilience and public realm visible together." },
  { id: "fabric", label: "Urban fabric", index: "04 / 06", title: "URBAN FABRIC", copy: "Urban grain and built form establish the context for intervention." },
  { id: "constraints", label: "Constraints", index: "05 / 06", title: "CONSTRAINTS", copy: "Limits become practical when their spatial consequences are read clearly." },
  { id: "opportunities", label: "Opportunities", index: "06 / 06", title: "OPPORTUNITIES", copy: "Civic potential emerges where systems can become shared value." },
] as const;

export const LENSES = [
  { id: "planning", label: ["Planning, Urban Design", "& Architecture"], caption: "BLOCK / PARCEL / CIVIC STRUCTURE", copy: "Shaping places that are strategic, functional and future-ready." },
  { id: "economics", label: ["Economics, Advisory", "& Development"], caption: "INTENSITY / VALUE / DEVELOPMENT LOGIC", copy: "Transforming ideas into investable and implementable projects." },
  { id: "geospatial", label: ["Digital & Geospatial", "Intelligence"], caption: "GIS / SUITABILITY / MAPPED INTELLIGENCE", copy: "Turning spatial data into actionable intelligence." },
  { id: "infrastructure", label: ["Infrastructure", "& Mobility"], caption: "CORRIDOR / UTILITY / TRANSIT", copy: "Designing connected infrastructure for sustainable growth." },
  { id: "sustainability", label: ["Sustainability", "& Social Impact"], caption: "BLUE-GREEN / RESILIENCE / ECOLOGICAL CONNECTION", copy: "Building resilient communities with measurable value." },
] as const;

export const FRAMEWORK_STAGES = [
  { id: "observe", label: "Observe", index: "01 / 05", title: "OBSERVE", copy: "Understand the place." },
  { id: "analyse", label: "Analyse", index: "02 / 05", title: "ANALYSE", copy: "Transform data into intelligence." },
  { id: "integrate", label: "Integrate", index: "03 / 05", title: "INTEGRATE", copy: "Connect planning, infrastructure and economics." },
  { id: "optimise", label: "Optimise", index: "04 / 05", title: "OPTIMISE", copy: "Test and refine development scenarios." },
  { id: "deliver", label: "Deliver", index: "05 / 05", title: "DELIVER", copy: "Implement resilient, future-ready solutions." },
] as const;

export type SectorId = "city" | "industrial" | "transport" | "energy" | "civic" | "environment" | "heritage" | "digital";

/** Eight sectors [PDF p.7]. `scope` is verbatim; `caption` is a shortened teaser of it for Home. */
export const SECTORS: { id: SectorId; name: string; typology: string; caption: string; scope: string }[] = [
  { id: "city", name: "Cities, Communities & Real Estate", typology: "URBAN FIELD", caption: "Master-planned communities, mixed-use developments, townships…", scope: "Master-planned communities, mixed-use developments, townships, urban regeneration, affordable housing." },
  { id: "industrial", name: "Industrial, Manufacturing & Logistics", typology: "LOGISTICS CORRIDOR", caption: "Industrial parks, manufacturing clusters, logistics hubs…", scope: "Industrial parks, manufacturing clusters, logistics hubs, corridors, SEZs and port-led developments." },
  { id: "transport", name: "Transport, Mobility & Aviation", typology: "MULTIMODAL NETWORK", caption: "Roads, highways, metro, rail, airports, ports…", scope: "Roads, highways, metro, rail, airports, ports, TOD, active mobility and multimodal transport." },
  { id: "energy", name: "Energy, Utilities & Resources", typology: "UTILITY MATRIX", caption: "Renewable energy, power infrastructure, water, wastewater…", scope: "Renewable energy, power infrastructure, water, wastewater, stormwater, solid waste, circular economy." },
  { id: "civic", name: "Government, Civic & Defence", typology: "CIVIC CAMPUS", caption: "Government buildings, civic infrastructure, institutional campuses…", scope: "Government buildings, civic infrastructure, institutional campuses, defence and municipal development." },
  { id: "environment", name: "Environment, Climate & Nature", typology: "WATERSHED SYSTEM", caption: "Climate resilience, ESG, biodiversity, nature-based solutions…", scope: "Climate resilience, ESG, biodiversity, nature-based solutions and blue-green infrastructure." },
  { id: "heritage", name: "Heritage, Culture & Tourism", typology: "PRECINCT GRAIN", caption: "Heritage precincts, museums, cultural centres, waterfronts…", scope: "Heritage precincts, museums, cultural centres, waterfronts, tourism destinations and place-making." },
  { id: "digital", name: "Digital Infrastructure & Smart Places", typology: "DATA FIELD", caption: "Smart cities, ICCCs, digital twins, GIS platforms…", scope: "Smart cities, ICCCs, digital twins, GIS platforms, technology parks and innovation districts." },
];

export const DIFFERENTIATORS: [string, string][] = [
  ["Global Perspective,", "Local Intelligence"],
  ["Multidisciplinary", "Expertise"],
  ["Intelligence-Driven", "Decisions"],
  ["From Strategy", "to Delivery"],
  ["Sustainability", "at the Core"],
  ["Trusted", "Partnerships"],
];
