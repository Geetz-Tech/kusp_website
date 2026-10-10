import { Eyebrow, SchematicTag, SectionLabel } from "@/components/primitives/SectionLabel";
import { TeaserLink } from "@/components/primitives/ActionLink";
import { ExpertiseSlice } from "@/components/art/ExpertiseArt";
import { ExpertiseStory } from "@/components/expertise/ExpertiseStory";
import { Stage } from "@/components/motion/Stage";

/** Expertise — Five Professional Lenses (tight analytical slice; five diagram grammars) */
export function ExpertisePage() {
  return (
    <>
      <section className="page-section expertise-hero" data-header-tone="light" aria-labelledby="expertise-title">
        <SectionLabel>01 / EXPERTISE</SectionLabel>
        <div className="heading">
          <Eyebrow>KUSP / FIVE PROFESSIONAL LENSES</Eyebrow>
          <h1 id="expertise-title">
            Five professional<br /><em>lenses.</em>
          </h1>
          <p className="body-copy">Five integrated practices connect planning, economics, spatial intelligence, infrastructure and sustainability.</p>
          <SchematicTag>Analytical site slice / schematic</SchematicTag>
        </div>
        <div className="lens-slice" aria-hidden="true">
          <Stage className="stage-fill slice-play" amount={0.25}>
            <ExpertiseSlice />
          </Stage>
        </div>
      </section>

      <ExpertiseStory />

      <section className="page-section expertise-close on-dark" data-header-tone="dark" aria-label="Next steps">
        <div className="page-close page-close--dark">
          <p className="page-close__line">Five practices, one integrated approach — applied through the Spatial Intelligence Framework™.</p>
          <div className="page-close__links">
            <TeaserLink href="/framework">See the framework</TeaserLink>
            <TeaserLink href="/contact">Start a project</TeaserLink>
          </div>
        </div>
      </section>
    </>
  );
}
