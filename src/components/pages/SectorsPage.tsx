import { Eyebrow, SectionLabel } from "@/components/primitives/SectionLabel";
import { TeaserLink } from "@/components/primitives/ActionLink";
import { SECTORS } from "@/lib/home-data";
import { SectorsStory } from "@/components/sectors/SectorsStory";

/** Sectors — Spatial Typologies (eight-state micro-world stage + persistent sector index) */
export function SectorsPage() {
  return (
    <>
      <SectorsStory />

      <section className="page-section sector-scopes" data-header-tone="light" aria-labelledby="scopes-title">
        <SectionLabel>02 / SCOPE BY SECTOR</SectionLabel>
        <div className="sector-scopes__grid">
          <div>
            <Eyebrow>REACH</Eyebrow>
            {/* Heading = PDF p.7 section title */}
            <h2 id="scopes-title">
              Sectors &amp; <em>Markets</em>
            </h2>
            {/* [SYNTH] */}
            <p className="body-copy">Eight sectors and markets in which the practice applies its planning, design and advisory capabilities.</p>
          </div>
          {/* Sector names and scopes — PDF p.7, verbatim */}
          <ol className="scope-list">
            {SECTORS.map((s, i) => (
              <li key={s.id}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.name}</h3>
                <p>{s.scope}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="page-close">
          <div className="page-close__links">
            <TeaserLink href="/expertise">Explore the five practices</TeaserLink>
            <TeaserLink href="/contact">Start a project</TeaserLink>
          </div>
        </div>
      </section>
    </>
  );
}
