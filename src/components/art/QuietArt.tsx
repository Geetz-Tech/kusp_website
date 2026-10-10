import type React from "react";
import { smooth, type V2 } from "@/lib/art/util";
import { Study, type StudyKind } from "./Study";

/** Insights — monochrome editorial crops of planning studies (publication rhythm, no content claims). */
export function JournalCrop({ kind, variant }: { kind: StudyKind; variant: number }) {
  return (
    <span className="journal-crop" aria-hidden="true">
      <Study kind={kind} variant={variant} plain />
    </span>
  );
}

/** Contact — a sparse, resolved orthographic field: few lines, one datum, one beginning. */
export function ResolvedField() {
  const contour = (k: number) => smooth(Array.from({ length: 7 }, (_, i) => [i * 110, 70 + k * 46 + Math.sin(i * 0.8 + k) * 14] as V2));
  const parcels: [number, number, number, number][] = [[150, 120, 120, 70], [290, 120, 90, 70], [150, 210, 230, 60], [420, 150, 110, 120]];
  return (
    <svg className="resolved-art" viewBox="0 0 660 400" aria-hidden="true" focusable="false">
      {[0, 1, 2].map((k) => <path key={k} className="rf-contour" pathLength={1} style={{ "--i": k } as React.CSSProperties} d={contour(k)} />)}
      <path className="rf-green" pathLength={1} d="M60 330C200 300 360 340 620 300" />
      {parcels.map(([x, y, w, h], i) => <rect key={i} className="rf-parcel" pathLength={1} style={{ "--i": i } as React.CSSProperties} x={x} y={y} width={w} height={h} />)}
      <rect className="rf-start" x="392" y="196" width="16" height="16" />
      <path className="rf-route" pathLength={1} d="M20 290C160 250 300 230 400 204S560 140 640 120" />
      <path className="rf-datum" pathLength={1} d="M60 360H600" />
      <path className="rf-tick" d="M60 352V368M600 352V368M330 356V364" />
      <text className="rf-label" x="60" y="388">DATUM / RESOLVED FIELD</text>
    </svg>
  );
}
