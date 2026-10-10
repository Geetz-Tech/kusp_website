import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import {
  ENQUIRY_LIMITS,
  ENQUIRY_MIN_FILL_MS,
  ENQUIRY_SECTORS,
  ENQUIRY_STAGES,
  ENQUIRY_SUPPORT,
} from "@/lib/enquiry";

/**
 * POST /api/contact — delivers a project enquiry to the KUSP inbox by SMTP, server-side only.
 * Nothing is stored: no database, no files, no logging of enquiry content. Credentials come from server environment
 * variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, optional SMTP_FROM / CONTACT_TO_EMAIL) and never reach the browser.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 24_000;
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const SITE_PAGE = `${SITE_ORIGIN || "https://www.kuspurban.com"}/contact`;

/* ---- lightweight in-memory protection (per Node process; resets on restart) ---- */
const hits = new Map<string, number[]>();
const seen = new Map<string, number>();
const WINDOW = 10 * 60_000;
const PER_IP = 5;
const GLOBAL_PER_HOUR = 60;
let globalHits: number[] = [];
function limited(ip: string, now: number): boolean {
  globalHits = globalHits.filter((t) => now - t < 3_600_000);
  if (globalHits.length >= GLOBAL_PER_HOUR) return true;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (list.length >= PER_IP) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  globalHits.push(now);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW)) hits.delete(k);
  return false;
}

const json = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const s = v.replace(/\r\n?/g, "\n").trim();
  return s.length > max ? null : s;
};
const oneLine = (s: string) => !/[\r\n\u2028\u2029]/.test(s);
const EMAIL = /^[^\s@<>"',;:()[\]\\]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const PHONE = /^[0-9+()\-.\s]{5,40}$/;

function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const ok = new Set<string>();
  if (SITE_ORIGIN) ok.add(new URL(SITE_ORIGIN).host);
  const reqHost = req.headers.get("host");
  if (reqHost) ok.add(reqHost);
  return ok.has(host);
}

export async function POST(req: Request) {
  if (!originAllowed(req)) return json({ ok: false, error: "forbidden" }, 403);
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return json({ ok: false, error: "bad_request" }, 415);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: "too_large" }, 413);
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  // honeypot: bots fill it. Report success without sending anything.
  if (typeof body.website === "string" && body.website.trim() !== "") return json({ ok: true });

  const now = Date.now();
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || req.headers.get("x-real-ip") || "unknown";
  if (limited(ip, now)) return json({ ok: false, error: "rate_limited" }, 429);

  const name = clean(body.name, ENQUIRY_LIMITS.name);
  const organisation = clean(body.organisation, ENQUIRY_LIMITS.organisation);
  const email = clean(body.email, ENQUIRY_LIMITS.email);
  const phone = body.phone === undefined || body.phone === "" ? "" : clean(body.phone, ENQUIRY_LIMITS.phone);
  const challenge = clean(body.challenge, ENQUIRY_LIMITS.challenge);
  const stage = typeof body.stage === "string" ? body.stage : "";
  const sectorId = typeof body.sector === "string" ? body.sector : "";
  const supportIds = Array.isArray(body.support) ? body.support : [];

  const sector = ENQUIRY_SECTORS.find(([id]) => id === sectorId);
  const support = [...new Set(supportIds)].map((id) => ENQUIRY_SUPPORT.find(([k]) => k === id));
  const valid =
    name && oneLine(name) &&
    organisation && oneLine(organisation) &&
    email && oneLine(email) && EMAIL.test(email) &&
    phone !== null && (phone === "" || (oneLine(phone) && PHONE.test(phone))) &&
    challenge && challenge.length >= 2 &&
    sector &&
    (ENQUIRY_STAGES as readonly string[]).includes(stage) &&
    support.length >= 1 && support.length <= ENQUIRY_SUPPORT.length && support.every(Boolean) &&
    body.consent === true;
  if (!valid) return json({ ok: false, error: "invalid" }, 400);

  const elapsed = typeof body.elapsed === "number" && Number.isFinite(body.elapsed) ? body.elapsed : 0;
  if (elapsed < ENQUIRY_MIN_FILL_MS) return json({ ok: false, error: "too_fast" }, 429);

  // duplicate protection (double click / retry): the same enquiry within 10 minutes is accepted once
  const fingerprint = createHash("sha256").update(`${email.toLowerCase()}\n${challenge}`).digest("hex");
  for (const [k, t] of seen) if (now - t > WINDOW) seen.delete(k);
  if (seen.has(fingerprint)) return json({ ok: true, duplicate: true });

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.error("contact: mail transport is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS)");
    return json({ ok: false, error: "unavailable" }, 503);
  }
  const port = Number(process.env.SMTP_PORT ?? 465);
  const to = process.env.CONTACT_TO_EMAIL || "info@kusp.com";
  const from = process.env.SMTP_FROM || user;

  const text = [
    "KUSP WEBSITE ENQUIRY",
    "",
    `Name: ${name}`,
    `Organisation: ${organisation}`,
    `Email: ${email}`,
    `Phone: ${phone || "-"}`,
    "",
    `What are you planning?: ${sector![1]}`,
    `Support required: ${support.map((s) => s![1]).join(", ")}`,
    `Project stage: ${stage}`,
    "",
    "Challenge:",
    challenge,
    "",
    "Submitted from:",
    SITE_PAGE,
    "",
    "Submission timestamp:",
    new Date(now).toISOString(),
  ].join("\n");

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    await transport.sendMail({
      from: { name: "KUSP Website", address: from },
      to,
      replyTo: { name: name.replace(/["<>\r\n]/g, ""), address: email },
      subject: `New KUSP Project Enquiry — ${sector![1]}`,
      text, // plain text only: nothing the visitor typed is ever interpreted as HTML
    });
  } catch (err) {
    // never log the enquiry itself, only the failure class
    console.error("contact: delivery failed", (err as { code?: string }).code ?? "unknown");
    return json({ ok: false, error: "delivery_failed" }, 502);
  }
  seen.set(fingerprint, now);
  return json({ ok: true });
}
