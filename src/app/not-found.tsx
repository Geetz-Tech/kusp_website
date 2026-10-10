import "@/styles/pages.css";
import "@/styles/pages-overrides.css";
import "@/styles/pages-art.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import { PageShell } from "@/components/layout/PageShell";
import { ActionLink } from "@/components/primitives/ActionLink";
import { Eyebrow, SectionLabel } from "@/components/primitives/SectionLabel";

export const metadata = { title: "Page not found | KUSP", robots: { index: false } };

export default function NotFound() {
  return (
    <PageShell variant="page">
      <section className="page-section" data-header-tone="light" style={{ minHeight: "70vh" }} aria-labelledby="nf-title">
        <SectionLabel>404 / OFF THE PLAN</SectionLabel>
        <div style={{ paddingTop: "7vh", maxWidth: 520 }}>
          <Eyebrow>KUSP / PAGE NOT FOUND</Eyebrow>
          <h1 id="nf-title">This page is <em>not on the plan.</em></h1>
          <p className="body-copy" style={{ margin: "28px 0 32px" }}>The page you were looking for does not exist.</p>
          <ActionLink href="/" filled arrow="↗">Return Home</ActionLink>
        </div>
      </section>
    </PageShell>
  );
}
