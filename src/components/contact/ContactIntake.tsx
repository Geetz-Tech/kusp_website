"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eyebrow, SectionLabel } from "@/components/primitives/SectionLabel";
import { ConsultantScene } from "./ConsultantScene";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, OFFICES } from "@/lib/site";

/**
 * Expert-guided enquiry — an architectural intake sheet, NOT a wizard: the whole structure is visible and native.
 * Not wired to a backend yet: nothing is sent, stored or opened (no fetch, no mailto, no endpoint). A valid submit says it is unavailable.
 * The consultant scene on the left follows the group in view (scroll only); it is decorative and carries no form meaning.
 */
const SECTORS: [string, string][] = [
  ["city", "City / Community"],
  ["industrial", "Industrial / Logistics"],
  ["transport", "Transport / Infrastructure"],
  ["energy", "Energy / Utilities"],
  ["civic", "Government / Civic"],
  ["environment", "Environment / Climate"],
  ["heritage", "Heritage / Tourism"],
  ["digital", "Digital / Smart Places"],
];
const SUPPORT: [string, string][] = [
  ["planning", "Planning & Urban Design"],
  ["economics", "Economics & Advisory"],
  ["geospatial", "Geospatial Intelligence"],
  ["infrastructure", "Infrastructure & Mobility"],
  ["sustainability", "Sustainability & Social Impact"],
  ["unsure", "Not sure yet"],
];
const STAGES = ["Exploring", "Feasibility", "Planning", "Approval / Procurement", "Implementation"];
const GROUPS = ["What are you planning?", "What support do you need?", "What stage are you at?", "Tell us briefly about the challenge", "Your details"];

export function ContactIntake() {
  const formRef = useRef<HTMLFormElement>(null);
  const supportRef = useRef<HTMLFieldSetElement>(null);
  const [step, setStep] = useState(0);
  const [sector, setSector] = useState<string | null>(null);
  const [stage, setStage] = useState<number | null>(null);
  const [notice, setNotice] = useState(false);

  /* the group crossing the reading line sets the field's state; stopping scrolling keeps it */
  useEffect(() => {
    const form = formRef.current;
    if (!form || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.group)); }),
      { rootMargin: "-40% 0px -50% 0px" },
    );
    form.querySelectorAll("fieldset[data-group]").forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, []);

  const checkSupport = () => {
    const boxes = Array.from(supportRef.current?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? []);
    const ok = boxes.some((b) => b.checked);
    boxes[0]?.setCustomValidity(ok ? "" : "Choose at least one — “Not sure yet” is fine.");
    return ok;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!checkSupport() || !e.currentTarget.checkValidity()) {
      setNotice(false);
      e.currentTarget.reportValidity();
      return;
    }
    setNotice(true);
  };

  const dataAttrs = { "data-step": String(step) };

  return (
    <>
    <section className="page-section contact-intake" data-header-tone="light" id="project-form" aria-labelledby="contact-title">
      <SectionLabel>01 / START A PROJECT</SectionLabel>
      <div className="ci-layout" {...dataAttrs}>
        <div className="ci-left">
          <Eyebrow>KUSP / START A PROJECT</Eyebrow>
          <h1 id="contact-title">
            Start a<br /><em>project.</em>
          </h1>
          <p className="body-copy ci-guide">Tell us the challenge. We&apos;ll help frame the next step.</p>
          <p className="body-copy ci-sub">
            Whether you&apos;re envisioning a new industrial city, revitalising an urban district, delivering critical infrastructure, or advancing sustainable development, KUSP is ready to help turn ambition into reality.
          </p>
          <figure className="ci-visual">
            <ConsultantScene />
            <figcaption>
              <span>{String(step + 1).padStart(2, "0")} / 05</span> {GROUPS[step]}
            </figcaption>
          </figure>
        </div>

        <form ref={formRef} className="ci-form" onSubmit={onSubmit} noValidate={false}>
          <p className="ci-note">Fields marked * are required.</p>

          <fieldset className="ci-group" data-group="0">
            <legend><span>01</span> What are you planning? *</legend>
            <div className="ci-options ci-options--2">
              {SECTORS.map(([id, label], i) => (
                <label key={id} className="ci-opt">
                  <input type="radio" name="sector" value={id} required checked={sector === id} onChange={() => setSector(id)} />
                  <span>{label}</span>
                  <i aria-hidden="true">{String(i + 1).padStart(2, "0")}</i>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="ci-group" data-group="1" ref={supportRef} onChange={checkSupport}>
            <legend><span>02</span> What support do you need? * <small>Choose any that apply.</small></legend>
            <div className="ci-options ci-options--2">
              {SUPPORT.map(([id, label]) => (
                <label key={id} className="ci-opt">
                  <input type="checkbox" name="support" value={id} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="ci-group" data-group="2">
            <legend><span>03</span> What stage are you at? *</legend>
            <div className="ci-stages">
              {STAGES.map((s, i) => (
                <label key={s} className="ci-opt ci-opt--stage">
                  <input type="radio" name="stage" value={s} required checked={stage === i} onChange={() => setStage(i)} />
                  <span>{s}</span>
                  <i aria-hidden="true">{String(i + 1).padStart(2, "0")}</i>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="ci-group" data-group="3">
            <legend><span>04</span> Tell us briefly about the challenge *</legend>
            <label htmlFor="ci-challenge" className="ci-help">Share the place, challenge, objective or decision you need help with. Please don&apos;t include confidential information.</label>
            <textarea id="ci-challenge" name="challenge" required rows={5} />
          </fieldset>

          <fieldset className="ci-group" data-group="4">
            <legend><span>05</span> Your details</legend>
            <div className="ci-fields">
              <div className="ci-field"><label htmlFor="ci-name">Name *</label><input id="ci-name" name="name" type="text" autoComplete="name" required /></div>
              <div className="ci-field"><label htmlFor="ci-org">Organisation *</label><input id="ci-org" name="organisation" type="text" autoComplete="organization" required /></div>
              <div className="ci-field"><label htmlFor="ci-email">Email *</label><input id="ci-email" name="email" type="email" autoComplete="email" required /></div>
              <div className="ci-field"><label htmlFor="ci-phone">Phone <small>(optional)</small></label><input id="ci-phone" name="phone" type="tel" autoComplete="tel" /></div>
            </div>
          </fieldset>

          <div className="ci-submit">
            <button type="submit" className="form-submit">Submit enquiry <b aria-hidden="true">↗</b></button>
            <p className="ci-status" role="status">{notice ? "Enquiry submission is currently unavailable." : ""}</p>
          </div>
        </form>
      </div>
    </section>
    <section className="ci-reach" aria-labelledby="reach-title" data-header-tone="light">
      <h2 id="reach-title">Reach the practice</h2>
      <div className="ci-offices">
        {OFFICES.map((o) => (
          <address key={o.id} className="ci-office">
            <h3 className="ci-office__k">{o.label}</h3>
            <p className="ci-office__addr">
              {o.address.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </p>
            <ul className="ci-office__links">
              <li><a href={CONTACT_EMAIL_HREF}>{CONTACT_EMAIL}</a></li>
              <li><a href={o.phoneHref}>{o.phone}</a></li>
              <li>
                <a className="ci-office__wa" href={o.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label={`${o.whatsappLabel} on WhatsApp (opens in a new tab)`}>
                  {o.whatsappLabel} <b aria-hidden="true">↗</b>
                </a>
              </li>
            </ul>
          </address>
        ))}
      </div>
    </section>
    </>
  );
}
