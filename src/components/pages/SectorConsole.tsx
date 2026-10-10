"use client";

import { useState } from "react";
import { SECTORS, type SectorId } from "@/lib/home-data";
import { TypologyStack } from "@/components/art/TypologyStack";

/** Sectors — one selectable micro-world stage (eight grammars), never cards. Focus and click are equivalent. */
export function SectorConsole() {
  const [sector, setSector] = useState<SectorId>("city");
  return (
    <div className="sector-console">
      <div className="sector-art" data-sector={sector} aria-hidden="true">
        <TypologyStack active={sector} mode="axo" />
      </div>
      {SECTORS.map((s) => (
        <p key={s.id} className="sector-summary" hidden={s.id !== sector}>
          {s.scope}
        </p>
      ))}
      <div className="sector-index" role="group" aria-label="KUSP sectors">
        {SECTORS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`sector-control${s.id === sector ? " is-active" : ""}`}
            aria-pressed={s.id === sector}
            onClick={() => setSector(s.id)}
            onFocus={() => setSector(s.id)}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
