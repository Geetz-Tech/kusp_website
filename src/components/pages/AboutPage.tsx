import type React from "react";
import { ActionLink } from "@/components/primitives/ActionLink";
import { Eyebrow, SchematicTag, SectionLabel } from "@/components/primitives/SectionLabel";
import { StateGroup } from "@/components/primitives/StateGroup";
import { DISCIPLINES, PARTNER_COPY, PHILOSOPHY_PAIRS, WHY_KUSP } from "@/lib/page-data";
import { DisciplineField } from "@/components/art/AboutArt";
import { AboutReveal } from "@/components/about/AboutReveal";
import { AboutSignature } from "@/components/about/AboutSignature";
import { Stage } from "@/components/motion/Stage";

/** About — Spatial Manifesto / Layered Practice (front-on vertical practice section on a burgundy datum) */
export function AboutPage() {
  return (
    <StateGroup initial="global">
      <AboutSignature />
      <AboutReveal />

      {/* Who We Are — PDF p.2, verbatim (continued): the rest of the opening statement, set as an editorial band */}
      <section className="page-section about-statement" data-header-tone="light" aria-label="Our approach">
        <div className="about-statement__tag">
          <SchematicTag>Layered practice / schematic</SchematicTag>
        </div>
        <div className="about-statement__cols" data-reveal>
          <p className="body-copy">
            We partner with governments, public agencies, private developers and international institutions to create resilient, economically competitive and future-ready places — combining strategic thinking, spatial intelligence and technical excellence.
          </p>
          <p className="body-copy">
            From policy formulation and investment strategies to master plans, infrastructure frameworks, GIS analytics and sustainability solutions, we help clients make informed decisions that generate lasting economic, environmental and community value.
          </p>
        </div>
      </section>

      <section className="page-section manifest-intro on-dark" data-header-tone="dark" aria-labelledby="manifesto-title">
        <SectionLabel>02 / MISSION &amp; DESIGN PHILOSOPHY</SectionLabel>
        <div className="intro-grid">
          <div>
            <Eyebrow>A LAYERED PRACTICE</Eyebrow>
            <h2 id="manifesto-title">
              Focused, viable<br /><em>and scalable.</em>
            </h2>
          </div>
          {/* Mission — PDF p.3, verbatim */}
          <p className="body-copy intro-mission">
            We are committed to delivering focused, commercially viable and scalable planning solutions that create measurable value — integrating spatial intelligence, economic strategy and environmental stewardship to empower governments, developers and communities.
          </p>
        </div>
        {/* All three principles and their statements are always visible: a ledger, no selection needed */}
        <ol className="pair-ledger" aria-label="Mission and design philosophy">
          {PHILOSOPHY_PAIRS.map((pair, i) => (
            <li key={pair.id} className="pair-row">
              <span className="pair-row__n">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="pair-row__t">{pair.label}</h3>
              <p className="pair-row__c">{pair.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-section discipline-field" data-header-tone="light" aria-labelledby="disciplines-title">
        <SectionLabel>03 / MULTIDISCIPLINARY EXPERTISE</SectionLabel>
        <Eyebrow>DISCIPLINES WORKING AS ONE</Eyebrow>
        <h2 id="disciplines-title">
          A practice built<br />across <em>relationships.</em>
        </h2>
        {/* PDF p.8 intro, first sentence */}
        <p className="body-copy discipline-intro">
          Our multidisciplinary team brings together expertise across urban planning, architecture, civil engineering, policy research, economics, procurement and geospatial intelligence.
        </p>
        <div className="discipline-wrap">
          <Stage className="stage-fill disc-play" amount={0.25}>
            <DisciplineField />
          </Stage>
          <ul className="discipline-ledger" aria-label="KUSP multidisciplinary disciplines">
            {DISCIPLINES.map((d, i) => (
              <li key={d} className="discipline">
                <span>{String(i + 1).padStart(2, "0")}</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-section about-why" data-header-tone="light" id="about-cta" aria-labelledby="why-title">
        <SectionLabel>04 / WHY KUSP</SectionLabel>
        <div className="why-grid why-ledger">
          <div className="why-ledger__lead">
            <Eyebrow>THE KRISHVI DIFFERENCE</Eyebrow>
            <h2 id="why-title">
              One practice.<em>Many readings.</em>
            </h2>
            {/* PDF p.9 strapline — used once, here only */}
            <p className="why-tagline">Planning beyond boundaries. Delivering impact beyond expectations.</p>
          </div>
          <ol className="why-rows" aria-label="Why KUSP principles">
            {WHY_KUSP.map(({ title: [a, b], copy }, i) => (
              <li key={a}>
                <span className="why-rows__n">{String(i + 1).padStart(2, "0")}</span>
                <strong className="why-rows__t">
                  {a} {b}
                </strong>
                <p className="why-rows__c">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="about-close">
          <p className="about-close__line">Let&apos;s Shape the Future Together</p>
          <p className="body-copy">{PARTNER_COPY}</p>
          <ActionLink href="/contact" filled arrow="↗">Partner With Us</ActionLink>
        </div>
      </section>
    </StateGroup>
  );
}
