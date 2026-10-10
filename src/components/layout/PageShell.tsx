import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { JsonLd } from "@/components/primitives/JsonLd";

type Props = {
  variant: "home" | "page";
  initialTone?: "light" | "dark";
  schema?: object;
  children: ReactNode;
};

/** Shared page frame: skip link, adaptive header, scoped main, footer. */
export function PageShell({ variant, initialTone = "light", schema, children }: Props) {
  return (
    <div className={variant === "home" ? "kp-home" : "kp-page"}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header initialTone={initialTone} />
      <main id="main">{children}</main>
      <Footer />
      {schema ? <JsonLd data={schema} /> : null}
    </div>
  );
}
