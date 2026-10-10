"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { PRACTICES } from "@/lib/page-data";
import { LensScenes } from "@/components/art/ExpertiseArt";
import { Stage } from "@/components/motion/Stage";

/**
 * Expertise — a vertical practice journey.
 * The visual stays sticky while the five practices scroll past; whichever practice is crossing the reading line
 * is active, and its own spatial scene is shown (massing, phasing, survey, corridor section, landscape section).
 * The rail is a progress indicator and an optional shortcut. Every practice's full copy is plain HTML.
 */
export function ExpertiseStory() {
  const listRef = useRef<HTMLOListElement>(null);
  const [idx, setIdx] = useState(0);
  const cur = PRACTICES[idx];

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setIdx(Number((e.target as HTMLElement).dataset.step)); }),
      { rootMargin: "-48% 0px -48% 0px" },
    );
    list.querySelectorAll("li[data-step]").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, []);

  const jump = useCallback((i: number) => {
    listRef.current?.querySelectorAll("li[data-step]")[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const at = btns.indexOf(document.activeElement as HTMLButtonElement);
    const n = Math.max(0, Math.min(PRACTICES.length - 1, (at < 0 ? idx : at) + d));
    jump(n);
    btns[n]?.focus({ preventScroll: true });
  };

  return (
    <section className="page-section lens-workbench xs-track on-dark" data-header-tone="dark" id="lenses" aria-label="The five practices">
      <SectionLabel>02 / THE FIVE PRACTICES</SectionLabel>
      <div className="xs-grid">
        <div className="xs-sticky">
          <div className="xs-visual lens-visual" data-lens={cur.id} aria-hidden="true">
            <Stage className="stage-fill lv-play" amount={0.01}>
              <LensScenes />
            </Stage>
          </div>
          <div className="xs-rail" role="group" aria-label="KUSP practices" onKeyDown={onKey}>
            {PRACTICES.map((p, i) => (
              <button key={p.id} type="button" className={"xs-rail__item" + (i === idx ? " is-active" : "")} aria-current={i === idx ? "true" : undefined} onClick={() => jump(i)}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <i className="xs-rail__label">{p.title}</i>
              </button>
            ))}
          </div>
        </div>
        <ol className="xs-steps" ref={listRef} aria-label="KUSP practice areas">
          {PRACTICES.map((p, i) => (
            <Fragment key={p.id}>
              {/* Service-portfolio groupings — PDF pp.4–5 */}
              {i === 0 && <li className="xs-group" aria-hidden="false">Service portfolio I — Planning &amp; Advisory</li>}
              {i === 2 && <li className="xs-group">Service portfolio II — Digital, Infrastructure &amp; Sustainability</li>}
              <li data-step={i} className={"xs-step" + (i === idx ? " is-active" : "")}>
                <span className="lens-kicker">{p.kicker}</span>
                <h2>{p.title}</h2>
                <p className="xs-lead">{p.lead}</p>
                <p className="lens-desc">{p.description}</p>
                <ul className="capability-list">
                  {p.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            </Fragment>
          ))}
        </ol>
      </div>
    </section>
  );
}
