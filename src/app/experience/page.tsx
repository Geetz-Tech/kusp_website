import "@/styles/pages.css";
import "@/styles/pages-overrides.css";
import "@/styles/pages-art.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import "@/styles/experience-story.css";
import "@/styles/dark-close.css";
import { PageShell } from "@/components/layout/PageShell";
import { ExperiencePage } from "@/components/pages/ExperiencePage";
import { pageMetadata, pageSchema } from "@/lib/seo";

const PATH = "/experience";
const TITLE = 'KUSP Experience | Planning, GIS & Advisory';
const DESCRIPTION = "Explore collective professional experience across planning, industrial development, GIS, mobility, feasibility, policy and advisory.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function Page() {
  return (
    <PageShell variant="page" initialTone="light" schema={pageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })}>
      <ExperiencePage />
    </PageShell>
  );
}
