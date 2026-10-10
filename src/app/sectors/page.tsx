import "@/styles/pages.css";
import "@/styles/pages-overrides.css";
import "@/styles/pages-art.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import "@/styles/sectors-story.css";
import { PageShell } from "@/components/layout/PageShell";
import { SectorsPage } from "@/components/pages/SectorsPage";
import { pageMetadata, pageSchema } from "@/lib/seo";

const PATH = "/sectors";
const TITLE = 'KUSP Sectors | Spatial Typologies & Markets';
const DESCRIPTION = "Explore KUSP’s work across cities, industry, transport, utilities, government, environment, heritage and digital infrastructure.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function Page() {
  return (
    <PageShell variant="page" initialTone="dark" schema={pageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })}>
      <SectorsPage />
    </PageShell>
  );
}
