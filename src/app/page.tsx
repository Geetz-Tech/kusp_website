import "@/styles/home.css";
import "@/styles/home-overrides.css";
import "@/styles/home-art.css";
import "@/styles/home-aerial.css";
import "@/styles/type.css";
import "@/styles/content.css";
import "@/styles/motion.css";
import "@/styles/lenses-3d.css";
import "@/styles/refine-home.css";
import { PageShell } from "@/components/layout/PageShell";
import {
  HomeFinal,
  HomeExperience,
  HomeFramework,
  HomeHero,
  HomeInsights,
  HomePractice,
  HomeSectors,
  HomeWho,
  HomeWhy,
} from "@/components/home/HomeSections";
import { pageMetadata, pageSchema } from "@/lib/seo";

const TITLE = "KUSP | Urban Planning, Spatial Intelligence & Infrastructure";
const DESCRIPTION =
  "KUSP is a multidisciplinary consultancy for urban planning, spatial intelligence, infrastructure, development advisory and sustainability.";

export const metadata = pageMetadata({
  path: "/",
  title: TITLE,
  description: DESCRIPTION,
  ogTitle: "KUSP | Designing Resilient Cities & Transformative Infrastructure",
  ogDescription: "Multidisciplinary planning, design and advisory for cities, industrial regions, infrastructure and sustainable development.",
});

export default function HomePage() {
  return (
    <PageShell variant="home" schema={pageSchema({ path: "/", name: TITLE, description: DESCRIPTION })}>
      <HomeHero />
      <HomeWho />
      <HomePractice />
      <HomeFramework />
      <HomeSectors />
      <HomeWhy />
      <HomeExperience />
      <HomeInsights />
      <HomeFinal />
    </PageShell>
  );
}
