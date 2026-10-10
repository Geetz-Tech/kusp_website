import type React from "react";
import { ActionLink, TeaserLink } from "@/components/primitives/ActionLink";
import { PARTNER_COPY, WHY_KUSP } from "@/lib/page-data";
import { Eyebrow, SectionLabel } from "@/components/primitives/SectionLabel";
import { MasterplanSvg } from "@/components/diagrams/MasterplanSvg";
import { LazyAerial } from "./LazyArt";
import { ExperienceScroll } from "./ExperienceScroll";
import { Stage } from "@/components/motion/Stage";
import type { StudyKind } from "@/components/art/Study";

const HOME_SHEETS: [StudyKind, string, string][] = [
  ["masterplan", "ev-a", "Masterplan framework, neutral study"],
  ["gis", "ev-b", "GIS suitability, neutral study"],
  ["regional", "ev-c", "Regional structure, neutral study"],
  ["mobility", "ev-d", "Mobility network, neutral study"],
  ["intensity", "ev-e", "Development intensity, neutral study"],
  ["bluegreen", "ev-f", "Blue-green system, neutral study"],
  ["process", "ev-g", "Feasibility and process diagram"],
];
import { FrameworkSequence, PracticeSection, SectorStage, WhoSection } from "./HomeInteractive";
import { HeroScene3D } from "@/components/three/Scene3DLayer";

/** 01 / PLACE — separate editorial field + the only low-oblique wide masterplan assembly */
export function HomeHero() {
  return (
    <section className="hero home-section" data-header-tone="light" aria-labelledby="hero-title">
      <SectionLabel variant="code">01 / PLACE</SectionLabel>
      <div className="hero-spec" aria-hidden="true">
        MASTERPLAN STUDY<br />SITE / 01<br />FRAME / A-24<br />SCHEMATIC / NOT TO SCALE
      </div>
      <div className="plan-view hero-plan">
        <Stage className="stage-fill hero-play" drift={16} amount={0.2}>
          <MasterplanSvg layers={[]} />
        </Stage>
        <HeroScene3D />
      </div>
      <div className="hero-copy">
        <Eyebrow>KUSP / KRISHVI UNIFIED SOLUTIONS PARTNERS</Eyebrow>
        <h1 id="hero-title">
          Designing resilient cities <em>&amp;</em> transformative infrastructure.
        </h1>
        <p className="hero-summary">
          KUSP is a multidisciplinary planning, design and advisory consultancy delivering integrated solutions for cities, industrial regions, infrastructure and sustainable development.
        </p>
        <p className="hero-specialisms">
          Planning <i>·</i> Design <i>·</i> Spatial Intelligence <i>·</i> Infrastructure <i>·</i> Advisory
        </p>
        <div className="hero-actions">
          <ActionLink href="#practice" filled arrow="↓">Explore Our Practice</ActionLink>
          <ActionLink href="/contact" arrow="↗">Start a Project</ActionLink>
        </div>
      </div>
      <div className="hero-legend" aria-hidden="true">
        <i /> DECISION CORRIDOR <span /> BLUE-GREEN SYSTEM
      </div>
    </section>
  );
}

/** 02 / READ — automatic, scroll-driven site reading (see WhoSection) */
export function HomeWho() {
  return <WhoSection />;
}

/** 03 / LENSES — one persistent place; pinned scroll sequence on wide screens (see PracticeSection) */
export function HomePractice() {
  return <PracticeSection />;
}

/** 04 / TRANSFORM */
export function HomeFramework() {
  return (
    <section className="framework home-section fw-track" id="framework" data-header-tone="light" aria-labelledby="framework-title">
      <SectionLabel variant="code">04 / TRANSFORM</SectionLabel>
      <div className="fw-sticky">
        <div className="framework-heading">
          <Eyebrow>THE SPATIAL INTELLIGENCE FRAMEWORK™</Eyebrow>
          <h2 id="framework-title">
            From insight<br />to <em>implementation.</em>
          </h2>
          <TeaserLink href="/framework">See the framework</TeaserLink>
        </div>
        <FrameworkSequence />
      </div>
    </section>
  );
}

/** 05 / REACH */
export function HomeSectors() {
  return (
    <section className="sectors sec-track home-section" id="sectors" data-header-tone="dark" aria-labelledby="sectors-title">
      <div className="sec-sticky">
        <SectionLabel variant="code">05 / REACH</SectionLabel>
        <div className="sectors-heading">
          <Eyebrow>SECTORS &amp; MARKETS</Eyebrow>
          <h2 id="sectors-title">
            Spatial knowledge,<br /><em>many conditions.</em>
          </h2>
          <p>Eight sectors and markets, each read through its own spatial conditions.</p>
          <TeaserLink href="/sectors">All eight sectors</TeaserLink>
        </div>
        <SectorStage />
      </div>
    </section>
  );
}

/** 06 / PRACTICE — the Krishvi difference as a disciplined two-zone editorial grid */
export function HomeWhy() {
  return (
    <section className="why home-section" id="why" data-header-tone="light" aria-labelledby="why-title">
      <SectionLabel variant="code">06 / PRACTICE</SectionLabel>
      <div className="why-heading">
        <Eyebrow>WHY KUSP</Eyebrow>
        <h2 id="why-title">
          One integrated practice.<br /><em>Multiple disciplines.</em>
        </h2>
        <TeaserLink href="/about#about-cta">The Krishvi Difference</TeaserLink>
      </div>
      <ol className="difference-grid" aria-label="The Krishvi difference">
        {WHY_KUSP.map((d, i) => (
          <li key={d.title[0]} className="difference">
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>
              {d.title[0]} {d.title[1]}
            </strong>
            <p>{d.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 07 / EVIDENCE — neutral, unattributed study fragments only */
export function HomeExperience() {
  return (
    <section className="experience exp-editorial exp-track home-section" id="experience" data-header-tone="light" aria-labelledby="experience-title">
      <SectionLabel variant="code">07 / EVIDENCE</SectionLabel>
      <div className="exp-sticky">
        <div className="experience-intro">
          <Eyebrow>COLLECTIVE PROFESSIONAL EXPERIENCE</Eyebrow>
          <h2 id="experience-title">
            Knowledge made<br /><em>practical.</em>
          </h2>
          <p>
            Experience represented across the practice spans statutory planning, master planning, industrial development, feasibility studies and GIS-led planning.
          </p>
          <TeaserLink href="/experience">Collective professional experience</TeaserLink>
        </div>
        <ExperienceScroll
          note={
            <>
              <ul className="sr-only" aria-label="Neutral planning studies">
                {HOME_SHEETS.map(([kind, , label]) => (
                  <li key={kind}>{label}</li>
                ))}
              </ul>
              <p className="evidence-note exp-note">Illustrative planning-studio studies. No individual, client or project attribution is shown.</p>
            </>
          }
        />
      </div>
    </section>
  );
}

/** 08 / PERSPECTIVES — teaser to the published one-minute reads */
export function HomeInsights() {
  return (
    <section className="insights home-section" id="insights" data-header-tone="dark" aria-labelledby="insights-title">
      <SectionLabel variant="code">08 / PERSPECTIVES</SectionLabel>
      <div className="insights-copy">
        <Eyebrow>INSIGHTS / PERSPECTIVES</Eyebrow>
        <h2 id="insights-title">
          Perspectives on<br /><em>resilient places.</em>
        </h2>
        <p>Short perspectives, research notes and thinking from the practice on resilient places, infrastructure and spatial intelligence.</p>
        <TeaserLink href="/insights">Insights</TeaserLink>
      </div>
      <ul className="insight-index" aria-label="Insight categories">
        <li><span>Perspective</span></li>
        <li><span>Research</span></li>
        <li><span>Thinking</span></li>
      </ul>
    </section>
  );
}

/** 09 / RESOLVE — calm high aerial closure */
export function HomeFinal() {
  return (
    <section className="final-cta home-section" id="contact" data-header-tone="light" aria-labelledby="cta-title">
      <SectionLabel variant="code">09 / RESOLVE</SectionLabel>
      <div className="plan-view final-plan">
        <Stage className="stage-fill aerial-play" drift={14} amount={0.25}>
          <LazyAerial />
        </Stage>
      </div>
      <div className="cta-copy">
        <Eyebrow>KUSP / RESOLVED PLACE</Eyebrow>
        <h2 id="cta-title">
          Let’s shape<br /><em>what’s next.</em>
        </h2>
        <p>{PARTNER_COPY}</p>
        <div className="hero-actions">
          <ActionLink href="/contact" filled arrow="↗">Start a Conversation</ActionLink>
          <ActionLink href="/contact" arrow="↗">Partner With Us</ActionLink>
        </div>
      </div>
      <p className="final-note">FINAL DEVELOPMENT BLOCKS / MOVEMENT HIERARCHY / BLUE-GREEN SYSTEM / KEY INFRASTRUCTURE</p>
    </section>
  );
}
