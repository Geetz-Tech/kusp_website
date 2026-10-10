/** Enquiry form vocabulary, shared by the Contact form (client) and POST /api/contact (server). */
export const ENQUIRY_SECTORS: [string, string][] = [
  ["city", "City / Community"],
  ["industrial", "Industrial / Logistics"],
  ["transport", "Transport / Infrastructure"],
  ["energy", "Energy / Utilities"],
  ["civic", "Government / Civic"],
  ["environment", "Environment / Climate"],
  ["heritage", "Heritage / Tourism"],
  ["digital", "Digital / Smart Places"],
];
export const ENQUIRY_SUPPORT: [string, string][] = [
  ["planning", "Planning & Urban Design"],
  ["economics", "Economics & Advisory"],
  ["geospatial", "Geospatial Intelligence"],
  ["infrastructure", "Infrastructure & Mobility"],
  ["sustainability", "Sustainability & Social Impact"],
  ["unsure", "Not sure yet"],
];
export const ENQUIRY_STAGES = ["Exploring", "Feasibility", "Planning", "Approval / Procurement", "Implementation"] as const;

export const ENQUIRY_LIMITS = { name: 120, organisation: 160, email: 254, phone: 40, challenge: 4000 } as const;
/** Fastest plausible time (ms) to fill five groups; faster submissions are treated as automated. */
export const ENQUIRY_MIN_FILL_MS = 3000;

export type EnquiryPayload = {
  sector: string; // id from ENQUIRY_SECTORS
  support: string[]; // ids from ENQUIRY_SUPPORT
  stage: string; // one of ENQUIRY_STAGES
  challenge: string;
  name: string;
  organisation: string;
  email: string;
  phone?: string;
  consent: boolean;
  website?: string; // honeypot, must stay empty
  elapsed: number; // ms between the form appearing and submit
};
