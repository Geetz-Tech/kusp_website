import "@/styles/pages.css";
import "@/styles/pages-overrides.css";
import "@/styles/pages-art.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import "@/styles/privacy.css";
import { PageShell } from "@/components/layout/PageShell";
import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { pageMetadata, pageSchema } from "@/lib/seo";

const PATH = "/privacy";
const TITLE = "Privacy Policy | KUSP";
const DESCRIPTION = "How KUSP handles the personal information you send through the website enquiry form.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function Page() {
  return (
    <PageShell variant="page" initialTone="light" schema={pageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })}>
      <PrivacyPage />
    </PageShell>
  );
}
