import Link from "next/link";
import { Eyebrow } from "@/components/primitives/SectionLabel";
import { ExperienceStory } from "@/components/experience/ExperienceStory";

/** Experience — Collective Professional Experience: a curated studio review driven by scroll (neutral studies only) */
export function ExperiencePage() {
  return (
    <>
      <ExperienceStory />

      <section className="page-section experience-close on-dark" data-header-tone="dark" aria-label="Next steps">
        <div className="xc-grid">
          <div className="xc-copy">
            <Eyebrow>COLLECTIVE PROFESSIONAL EXPERIENCE</Eyebrow>
            {/* Approved Experience framing (same sentence as the Home teaser); no new claims */}
            <p className="xc-line">
              Experience represented across the practice spans statutory planning, master planning, industrial development, feasibility studies and GIS-led planning.
            </p>
          </div>
          <ul className="xc-links">
            <li>
              <Link className="xc-link" href="/expertise">
                <span>Explore the five practices</span>
                <b aria-hidden="true">→</b>
              </Link>
            </li>
            <li>
              <Link className="xc-link" href="/contact">
                <span>Start a project</span>
                <b aria-hidden="true">→</b>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
