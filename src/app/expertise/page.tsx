import "@/styles/pages.css";
import "@/styles/pages-overrides.css";
import "@/styles/pages-art.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import "@/styles/expertise-story.css";
import "@/styles/dark-close.css";
import { PageShell } from "@/components/layout/PageShell";
import { ExpertisePage } from "@/components/pages/ExpertisePage";
import { pageMetadata, pageSchema } from "@/lib/seo";

const PATH = "/expertise";
const TITLE = 'KUSP Expertise | Five Planning & Infrastructure Practices';
const DESCRIPTION = "Explore KUSP’s five practices across planning, development advisory, geospatial intelligence, infrastructure, mobility and sustainability.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function Page() {
  return (
    <PageShell variant="page" initialTone="light" schema={pageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })}>
      <ExpertisePage />
    </PageShell>
  );
}
