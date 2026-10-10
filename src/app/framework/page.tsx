import "@/styles/pages.css";
import "@/styles/pages-overrides.css";
import "@/styles/pages-art.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import "@/styles/framework-story.css";
import { PageShell } from "@/components/layout/PageShell";
import { FrameworkPage } from "@/components/pages/FrameworkPage";
import { pageMetadata, pageSchema } from "@/lib/seo";

const PATH = "/framework";
const TITLE = 'Spatial Intelligence Framework™ | KUSP';
const DESCRIPTION = 'Explore KUSP’s five-stage Spatial Intelligence Framework™: Observe, Analyse, Integrate, Optimise and Deliver—from understanding place to future-ready solutions.';

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function Page() {
  return (
    <PageShell variant="page" initialTone="light" schema={pageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })}>
      <FrameworkPage />
    </PageShell>
  );
}
