/**
 * KUSP Insights — three one-minute reads. Editorial viewpoints only: no authors, dates, clients, projects,
 * places, statistics or claims of completed work. Reading time label is fixed at "1 min read".
 */
export type Insight = {
  id: "perspective" | "research" | "thinking";
  n: string;
  category: string;
  title: string;
  hook: string;
  body: string[];
};

export const INSIGHTS: Insight[] = [
  {
    id: "perspective",
    n: "01",
    category: "PERSPECTIVE",
    title: "Why blue-green infrastructure should be planned before roads",
    hook: "Water, landscape and movement systems work better when they are planned as one structure rather than added after the masterplan is fixed.",
    body: [
      "Most masterplans begin with a movement network and fit everything else around it. Water, drainage and landscape arrive later, as constraints to be managed rather than as structure to build from.",
      "Reversing the order changes the plan. When the river corridor, flood edge and green connections are set first, they define where development can sit, where it should step back, and where streets can cross water at the right points. Roads then follow a logic the land already provides.",
      "The benefits are practical. Stormwater has room to move. Open space becomes continuous instead of leftover. Blocks gain a clear frontage onto the public realm, and movement alignments can double as greenways.",
      "None of this removes the need for road planning. It asks that water, landscape and movement be designed together, as one structure, before the masterplan is fixed and the cost of change rises.",
    ],
  },
  {
    id: "research",
    n: "02",
    category: "RESEARCH",
    title: "From GIS layers to development decisions",
    hook: "Spatial data becomes valuable only when it changes the decisions planners, developers and infrastructure teams make.",
    body: [
      "A GIS map can hold hundreds of layers and still decide nothing. Spatial data earns its place only when it changes what planners, developers and infrastructure teams do next.",
      "The useful sequence is simple. Start with the base: terrain, water, existing movement and land use. Add suitability, to show where development is easiest and where it is not. Overlay constraints such as flood edges, slopes and protected areas. Then test accessibility, because a suitable parcel that cannot be reached or serviced is rarely a good one.",
      "Only at that point does a preferred development response make sense: which land to build on, which to keep open, and what to phase first.",
      "The test of any analysis is whether a decision is different because of it. If a layer does not move a boundary, a phasing line or an investment case, it is background, not intelligence.",
    ],
  },
  {
    id: "thinking",
    n: "03",
    category: "THINKING",
    title: "What makes an industrial park investment-ready?",
    hook: "Land availability alone does not make an industrial location viable; infrastructure, phasing, approvals and economic logic must work together.",
    body: [
      "Land availability alone does not make an industrial location viable. Investors and occupiers look for a place that can operate on day one and grow without disruption.",
      "Four things have to work together. Infrastructure: reliable access for freight, power, water and wastewater, planned at the scale of the full park rather than the first plot. Phasing: a sequence of development that matches likely demand, so early occupiers are not left in a construction site and capital is not committed years ahead of need. Approvals: a clear regulatory path, with permissions and conditions understood early. Economic logic: a credible case for why this location, for these users, at this cost.",
      "Where any one of these is weak, the others cannot compensate. Readiness is therefore less a feature of the land than a property of the plan: parcels, service spine, freight access and expansion land arranged so each stage can be delivered and used.",
    ],
  },
];
