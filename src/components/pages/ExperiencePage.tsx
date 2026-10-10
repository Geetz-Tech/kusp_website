import { TeaserLink } from "@/components/primitives/ActionLink";
import { ExperienceStory } from "@/components/experience/ExperienceStory";

/** Experience — Collective Professional Experience: a curated studio review driven by scroll (neutral studies only) */
export function ExperiencePage() {
  return (
    <>
      <ExperienceStory />

      <section className="page-section experience-close on-dark" data-header-tone="dark" aria-label="Next steps">
        <div className="page-close page-close--dark">
          <div className="page-close__links">
            <TeaserLink href="/expertise">Explore the five practices</TeaserLink>
            <TeaserLink href="/contact">Start a project</TeaserLink>
          </div>
        </div>
      </section>
    </>
  );
}
