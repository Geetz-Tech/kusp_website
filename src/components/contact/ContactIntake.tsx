"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eyebrow, SectionLabel } from "@/components/primitives/SectionLabel";
import { ConsultantScene } from "./ConsultantScene";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, OFFICES } from "@/lib/site";
import { ENQUIRY_STAGES, ENQUIRY_SECTORS as SECTORS, ENQUIRY_SUPPORT as SUPPORT } from "@/lib/enquiry";

/**
 * Expert-guided enquiry — an architectural intake sheet, NOT a wizard: the whole structure is visible and native.
 * Submits to POST /api/contact (server-side email to the KUSP inbox). Nothing is stored in the browser; the success message is only shown after the server confirms delivery.
 * The consultant scene on the left follows the group in view (scroll only); it is decorative and carries no form meaning.
 */
const STAGES = ENQUIRY_STAGES;
const GROUPS = ["What are you planning?", "What support do you need?", "What stage are you at?", "Tell us briefly about the challenge", "Your details"];

export function ContactIntake() {
  const formRef = useRef<HTMLFormElement>(null);
  const supportRef = useRef<HTMLFieldSetElement>(null);
  const [step, setStep] = useState(0);
  const [sector, setSector] = useState<string | null>(null);
  const [stage, setStage] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const shownAt = useRef(0);
  useEffect(() => { shownAt.current = Date.now(); }, []);

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

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (status === "sending") return; // duplicate-submit guard
    if (!checkSupport() || !form.checkValidity()) {
      setStatus("idle");
      form.reportValidity();
      return;
    }
    const fd = new FormData(form);
    const text = (k: string) => String(fd.get(k) ?? "");
    const payload = {
      sector: text("sector"),
      support: fd.getAll("support").map(String),
      stage: text("stage"),
      challenge: text("challenge"),
      name: text("name"),
      organisation: text("organisation"),
      email: text("email"),
      phone: text("phone"),
      consent: fd.get("consent") === "on",
      website: text("website"),
      elapsed: Date.now() - shownAt.current,
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && data?.ok === true) {
        form.reset();
        setSector(null);
        setStage(null);
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
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

          <div className="ci-hp" aria-hidden="true">
            <label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>

          <div className="ci-submit">
            <label className="ci-opt ci-consent">
              <input type="checkbox" name="consent" required />
              <span>I agree that KUSP may use the information provided to respond to this enquiry. See our <a href="/privacy" target="_blank" rel="noopener">Privacy Policy<span className="sr-only"> (opens in a new tab)</span></a>.</span>
            </label>
            <button type="submit" className="form-submit" disabled={status === "sending"} aria-busy={status === "sending"}>
              {status === "sending" ? "Sending…" : <>Submit enquiry <b aria-hidden="true">↗</b></>}
            </button>
            <div className="ci-status" role="status">
              {status === "sent" ? (
                <>
                  <strong>Thank you. Your enquiry has been sent to KUSP.</strong>
                  <span>We&apos;ll review the details you&apos;ve shared and respond using the contact information provided.</span>
                </>
              ) : null}
              {status === "error" ? (
                <>
                  <strong>Your enquiry could not be sent. Please try again or contact KUSP directly.</strong>
                  <span className="ci-status__links">
                    <a href={CONTACT_EMAIL_HREF}>{CONTACT_EMAIL}</a>
                    {OFFICES.map((o) => (
                      <a key={o.id} href={o.whatsappHref} target="_blank" rel="noopener noreferrer">
                        {o.whatsappLabel} <b aria-hidden="true">↗</b>
                        <span className="sr-only"> on WhatsApp (opens in a new tab)</span>
                      </a>
                    ))}
                  </span>
                </>
              ) : null}
            </div>
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
