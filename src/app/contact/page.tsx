import "@/styles/pages.css";
import "@/styles/pages-overrides.css";
import "@/styles/pages-art.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import "@/styles/contact-intake.css";
import { PageShell } from "@/components/layout/PageShell";
import { ContactPage } from "@/components/pages/ContactPage";
import { pageMetadata, pageSchema } from "@/lib/seo";

const PATH = "/contact";
const TITLE = 'Contact KUSP | Start a Project';
const DESCRIPTION = 'Start a project conversation with KUSP. We work across cities, industrial regions, infrastructure and sustainable development.';

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function Page() {
  return (
    <PageShell variant="page" initialTone="light" schema={pageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })}>
      <ContactPage />
    </PageShell>
  );
}
