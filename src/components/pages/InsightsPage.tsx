import { Eyebrow, SchematicTag, SectionLabel } from "@/components/primitives/SectionLabel";
import { INSIGHTS } from "@/lib/insights";
import { BlueGreenStudy, GisDecisionStudy, IndustrialStudy } from "@/components/insights/InsightsArt";
import { InsightsReveal } from "@/components/insights/InsightsReveal";

const ART = { perspective: BlueGreenStudy, research: GisDecisionStudy, thinking: IndustrialStudy };

/** Insights — a concise editorial practice: three one-minute reads, one per category. Editorial viewpoints only. */
export function InsightsPage() {
  return (
    <>
      <InsightsReveal />
      <section className="page-section insights-intro on-dark" data-header-tone="dark" aria-labelledby="insights-title">
        <SectionLabel>01 / INSIGHTS</SectionLabel>
        <div className="ins-intro">
          <div>
            <Eyebrow>KUSP / INSIGHTS</Eyebrow>
            <h1 id="insights-title">
              Perspectives on<br /><em>resilient places.</em>
            </h1>
          </div>
          <div className="ins-intro__side">
            <p className="lead">Short notes from the practice on planning, spatial intelligence and infrastructure. Three one-minute reads, one for each way we write: Perspective, Research and Thinking.</p>
            <ol className="ins-index" aria-label="The three reads">
              {INSIGHTS.map((a) => (
                <li key={a.id}>
                  <a href={`#${a.id}`}>
                    <span>{a.n}</span>
                    <strong>{a.category}</strong>
                    <em>{a.title}</em>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="page-section ins-reads" data-header-tone="light" aria-label="One-minute reads">
        {INSIGHTS.map((a, i) => {
          const Art = ART[a.id];
          return (
            <article key={a.id} id={a.id} className={`ins-row ins-row--${i % 2 ? "r" : "l"}`} aria-labelledby={`${a.id}-title`}>
              <div className="ins-copy">
                <p className="ins-cat"><span>{a.n}</span> / {a.category}</p>
                <h2 id={`${a.id}-title`}>{a.title}</h2>
                <p className="ins-hook">{a.hook}</p>
                <p className="ins-meta"><i aria-hidden="true" />1 min read</p>
                <details className="ins-body">
                  <summary>Read the note</summary>
                  <div className="ins-body__text">
                    {a.body.map((p, k) => (
                      <p key={k}>{p}</p>
                    ))}
                  </div>
                </details>
              </div>
              <figure className="ins-art">
                <Art />
              </figure>
            </article>
          );
        })}
      </section>

      <section className="page-section ins-close on-dark" data-header-tone="dark" aria-label="Areas of practice">
        <div className="ins-close__grid">
          <Eyebrow>PERSPECTIVE / RESEARCH / THINKING</Eyebrow>
          {/* Areas of interest: terms from the PDF service lists only */}
          <p className="journal-areas">
            <span>Areas the practice works across include</span> transit-oriented development, blue-green infrastructure, land pooling and land monetisation, digital twins and GIS-led planning, climate action and decarbonisation, and inclusive, gender-responsive planning.
          </p>
          <SchematicTag>Editorial viewpoints of the practice</SchematicTag>
        </div>
      </section>
    </>
  );
}
