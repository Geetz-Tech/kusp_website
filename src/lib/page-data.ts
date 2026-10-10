/**
 * Approved copy for About / Expertise / Framework / Experience.
 * Factual source: KUSP Corporate Capabilities PDF. Tags in comments:
 * [PDF] verbatim, [PDF-adapted] minimal web edit, [SYNTH] connecting copy built only from PDF terms.
 */

export const PRACTICES = [
  {
    id: "planning",
    kicker: "PRACTICE 01 / PLANNING & ADVISORY",
    title: "Planning, Urban Design & Architecture",
    lead: "Shaping places that are strategic, functional and future-ready.",
    /** [SYNTH] from this practice's PDF capability list only */
    description: "Planning work spans every scale, from regional and metropolitan plans to master plans, townships, transit-oriented development and urban regeneration. It extends into architectural design and space planning for civic, institutional and industrial facilities, supported by land pooling frameworks, development control regulations and design guidelines.",
    items: [
      "Regional & Metropolitan Planning",
      "Industrial Parks & Smart Cities",
      "Master Planning & Township Development",
      "Transit-Oriented Development (TOD)",
      "Urban Regeneration & Waterfront Development",
      "Land Pooling & Development Frameworks",
      "Architectural Design & Space Planning",
      "Civic, Institutional & Industrial Facilities",
      "Development Control Regulations & Design Guidelines",
    ],
  },
  {
    id: "economics",
    kicker: "PRACTICE 02 / PLANNING & ADVISORY",
    title: "Economics, Advisory & Development",
    lead: "Transforming ideas into investable and implementable projects.",
    /** [SYNTH] from this practice's PDF capability list only */
    description: "Advisory work links planning to investment. It covers strategic and policy advice, market and economic feasibility, cost-benefit analysis and detailed project reports, through to public-private partnership advisory, land monetisation, procurement and bid management, and asset and portfolio management.",
    items: [
      "Strategic Planning & Policy Advisory",
      "Detailed Project Reports (DPR)",
      "Market & Economic Feasibility",
      "Public-Private Partnership (PPP) Advisory",
      "Investment & Land Monetisation Strategies",
      "Cost-Benefit Analysis",
      "Procurement & Bid Management",
      "Asset & Portfolio Management",
    ],
  },
  {
    id: "geospatial",
    kicker: "PRACTICE 03 / DIGITAL, INFRASTRUCTURE & SUSTAINABILITY",
    title: "Digital & Geospatial Intelligence",
    lead: "Turning spatial data into actionable intelligence.",
    /** [SYNTH] from this practice's PDF capability list only */
    description: "Geospatial work brings enterprise GIS, land information systems, remote sensing and drone mapping into the planning process. Site suitability analysis, digital twins, 3D city modelling, AI-enabled planning tools and data visualisation support clear, evidence-based decisions.",
    items: [
      "Enterprise GIS & Spatial Analytics",
      "Land Information Systems",
      "Remote Sensing & Drone Mapping",
      "Site Suitability Analysis",
      "Digital Twins & 3D City Modelling",
      "AI-enabled Planning Tools",
      "Data Visualisation & Decision Support",
    ],
  },
  {
    id: "infrastructure",
    kicker: "PRACTICE 04 / DIGITAL, INFRASTRUCTURE & SUSTAINABILITY",
    title: "Infrastructure & Mobility",
    lead: "Designing connected infrastructure for sustainable growth.",
    /** [SYNTH] from this practice's PDF capability list only */
    description: "Infrastructure work plans the networks that make places function: transport and mobility, public transport and TOD integration, and active mobility. It also covers traffic impact assessment, road and utility corridors, water supply and sewerage, stormwater, solid waste and energy infrastructure.",
    items: [
      "Transport & Mobility Planning",
      "Traffic Impact Assessment",
      "Public Transport & TOD Integration",
      "Active Mobility (NMT)",
      "Road & Utility Corridor Planning",
      "Water Supply & Sewerage Planning",
      "Stormwater & Solid Waste Management",
      "Energy Infrastructure Planning",
    ],
  },
  {
    id: "sustainability",
    kicker: "PRACTICE 05 / DIGITAL, INFRASTRUCTURE & SUSTAINABILITY",
    title: "Sustainability & Social Impact",
    lead: "Building resilient communities with measurable value.",
    /** [SYNTH] from this practice's PDF capability list only */
    description: "Sustainability work spans climate action planning, environmental planning and blue-green infrastructure, together with ESG advisory and net zero and decarbonisation strategies. It also addresses social impact assessment, affordable housing, gender-responsive and inclusive planning, and SDG integration.",
    items: [
      "Climate Action Planning",
      "ESG & Sustainability Advisory",
      "Environmental Planning",
      "Blue-Green Infrastructure",
      "Net Zero & Decarbonisation Strategies",
      "Social Impact Assessment",
      "Affordable Housing",
      "Gender-responsive & Inclusive Planning",
      "SDG Integration",
    ],
  },
] as const;

export const PHILOSOPHY_PAIRS = [
  { id: "global", label: "Global & Local", copy: "We combine global planning standards with local knowledge, regulatory frameworks and community aspirations." }, // [PDF]
  { id: "physical", label: "Physical & Digital", copy: "We design both the built environment and the digital ecosystems that enable smarter, more efficient cities." }, // [PDF]
  { id: "impact", label: "Design & Impact", copy: "We measure success by tangible outcomes — places that are livable, commercially viable, resilient and built for lasting impact." }, // [PDF]
] as const;

export const DISCIPLINES = [
  "Urban planning",
  "Architecture",
  "Civil engineering",
  "Policy research",
  "Economics & procurement",
  "Geospatial intelligence",
];

/** Stage names + statements [PDF p.6]; `note` is [SYNTH] (max ~2 sentences, PDF service terms only). */
export const FRAMEWORK_PAGE_STAGES = [
  { id: "observe", label: "Observe", copy: "Understand the place.", note: "Each engagement starts with the place itself: its land, movement, water, communities, regulatory framework and development context." },
  { id: "analyse", label: "Analyse", copy: "Transform data into intelligence.", note: "GIS, remote sensing and spatial analytics bring the evidence together, so constraints, opportunities and site suitability become clear." },
  { id: "integrate", label: "Integrate", copy: "Connect planning, infrastructure and economics.", note: "Land use, mobility, utilities, market feasibility and environmental systems are considered together, so each decision reflects its spatial, economic and environmental consequences." },
  { id: "optimise", label: "Optimise", copy: "Test and refine development scenarios.", note: "Alternative development scenarios are compared and refined, informed by feasibility, cost-benefit and phasing considerations, to reach a preferred direction." },
  { id: "deliver", label: "Deliver", copy: "Implement resilient, future-ready solutions.", note: "The preferred direction becomes implementable outputs, such as master plans, development control regulations, detailed project reports, and procurement and implementation support." },
] as const;

/** [SYNTH] claim-safe theme lines from PDF p.8 experience topics: no individuals, employers or named projects. */
export const EXPERIENCE_THEMES = [
  { id: "statutory", label: "Statutory planning", copy: "Experience represented across the practice includes statutory planning, regulatory frameworks and development-control processes." },
  { id: "master", label: "Master planning", copy: "Experience represented across the practice includes master planning and new-town planning, including feasibility reports, project-area delineation and support for government notifications." },
  { id: "industrial", label: "Industrial development", copy: "Experience represented across the practice includes planning and development frameworks for industrial parks, and guidance documents supporting detailed project report preparation." },
  { id: "regional", label: "Regional planning", copy: "Experience represented across the practice includes regional planning and spatial development frameworks at district and multi-district scale." },
  { id: "gis", label: "GIS & spatial analysis", copy: "Experience represented across the practice includes GIS mapping, spatial analysis and AI-driven planning tools, along with GIS and technical-report support for official plans." },
  { id: "mobility", label: "Mobility", copy: "Experience represented across the practice includes active transportation planning, supported by GIS mapping and analysis." },
  { id: "feasibility", label: "Economic feasibility", copy: "Experience represented across the practice includes market and economic feasibility studies." },
  { id: "policy", label: "Policy & advisory", copy: "Experience represented across the practice includes policy research and planning advisory, including affordable housing strategy." },
  { id: "procurement", label: "Procurement & implementation", copy: "Experience represented across the practice includes procurement strategy and implementation-oriented planning support." },
] as const;

/** Why KUSP: titles and descriptions [PDF p.9]. */
export const WHY_KUSP: { title: [string, string]; copy: string }[] = [
  { title: ["Global Perspective,", "Local Intelligence"], copy: "Integrating international best practices with local context, regulatory frameworks and stakeholder aspirations." },
  { title: ["Multidisciplinary", "Expertise"], copy: "Planners, architects, economists, engineers, geospatial specialists and sustainability professionals working as one team." },
  { title: ["Intelligence-Driven", "Decisions"], copy: "Harnessing GIS, remote sensing, AI, digital twins and advanced analytics for confident decision-making." },
  { title: ["From Strategy", "to Delivery"], copy: "Supporting clients from visioning and feasibility through planning, approvals, implementation and asset optimisation." },
  { title: ["Sustainability", "at the Core"], copy: "Guided by environmental stewardship, climate resilience, social inclusion and economic viability." },
  { title: ["Trusted", "Partnerships"], copy: "Collaboration, transparency and long-term relationships that deliver practical, measurable outcomes." },
];

/** Closing invitation [PDF p.10]: one wording site-wide. */
export const PARTNER_COPY =
  "Whether you're envisioning a new industrial city, revitalising an urban district, delivering critical infrastructure, or advancing sustainable development, KUSP is ready to help turn ambition into reality. Partner with us to create resilient places, transformative infrastructure and sustainable communities that stand the test of time.";

/** Enquiry project stages: from the PDF "From Strategy to Delivery" lifecycle; "Early idea" is [SYNTH]. */
export const PROJECT_STAGES = ["Early idea", "Visioning & feasibility", "Planning & approvals", "Implementation", "Asset optimisation"];
