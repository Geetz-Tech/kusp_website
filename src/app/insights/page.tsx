import "@/styles/pages.css";
import "@/styles/pages-overrides.css";
import "@/styles/pages-art.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import "@/styles/insights-story.css";
import { PageShell } from "@/components/layout/PageShell";
import { InsightsPage } from "@/components/pages/InsightsPage";
import { pageMetadata, pageSchema } from "@/lib/seo";

const PATH = "/insights";
const TITLE = 'KUSP Insights | Perspective, Research & Thinking';
const DESCRIPTION = "Perspectives, research and thinking from KUSP across planning, resilient places, infrastructure and spatial intelligence.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function Page() {
  return (
    <PageShell variant="page" initialTone="dark" schema={pageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })}>
      <InsightsPage />
    </PageShell>
  );
}
