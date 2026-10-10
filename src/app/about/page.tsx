import "@/styles/pages.css";
import "@/styles/pages-overrides.css";
import "@/styles/pages-art.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import "@/styles/about-refine.css";
import "@/styles/dark-close.css";
import { PageShell } from "@/components/layout/PageShell";
import { AboutPage } from "@/components/pages/AboutPage";
import { pageMetadata, pageSchema } from "@/lib/seo";

const PATH = "/about";
const TITLE = 'About KUSP | Planning, Design & Advisory';
const DESCRIPTION = 'Learn about KUSP’s multidisciplinary planning, design and advisory practice, mission, design philosophy and integrated approach to resilient places.';

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function Page() {
  return (
    <PageShell variant="page" initialTone="light" schema={pageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })}>
      <AboutPage />
    </PageShell>
  );
}
