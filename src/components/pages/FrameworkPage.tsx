import { Eyebrow, SchematicTag, SectionLabel } from "@/components/primitives/SectionLabel";
import { FrameworkSplit } from "@/components/art/FrameworkBoard";
import { FrameworkStory } from "@/components/framework/FrameworkStory";
import { Stage } from "@/components/motion/Stage";
import { TeaserLink } from "@/components/primitives/ActionLink";

/** Framework — Transformation Sequence (flattened planning board, five-stage rail) */
export function FrameworkPage() {
  return (
    <>
      <section className="page-section framework-hero" data-header-tone="light" aria-labelledby="framework-title">
        <SectionLabel>01 / SPATIAL INTELLIGENCE FRAMEWORK™</SectionLabel>
        <div className="framework-heading">
          <Eyebrow>FROM INSIGHT TO IMPLEMENTATION</Eyebrow>
          <h1 id="framework-title">
            The Spatial Intelligence<br /><em>Framework™</em>
          </h1>
          {/* PDF p.6 */}
          <p className="body-copy">Our service delivery approach — five stages from insight to implementation.</p>
          {/* [SYNTH] */}
          <p className="body-copy">The framework connects KUSP&apos;s five practices, so that planning, economics, geospatial intelligence, infrastructure and sustainability inform one another at every stage.</p>
          <SchematicTag>Planning board / from insight to implementation</SchematicTag>
        </div>
        <div className="framework-stage-board" aria-hidden="true">
          <Stage className="stage-fill split-play" amount={0.3}>
            <FrameworkSplit />
          </Stage>
        </div>
      </section>

      <FrameworkStory />

      <section className="page-section framework-close on-dark" data-header-tone="dark" aria-label="Next steps">
        <div className="page-close page-close--dark">
          <p className="page-close__line">From insight to implementation.</p>
          <div className="page-close__links">
            <TeaserLink href="/expertise">Explore the five practices</TeaserLink>
            <TeaserLink href="/contact">Start a project</TeaserLink>
          </div>
        </div>
      </section>
    </>
  );
}
