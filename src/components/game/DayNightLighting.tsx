/** Time-of-day lighting model shared by the home scene and HUD. */
export interface Light {
  phase: "dawn" | "day" | "dusk" | "night";
  sky: [string, string];
  tint: string; tintOpacity: number;
  beam: number; beamColor: string;
  lampBoost: number;
  backdrop: string;
}

export function lightFor(hour: number): Light {
  if (hour >= 20 || hour < 5) return {
    phase: "night", sky: ["oklch(0.18 0.06 270)", "oklch(0.3 0.08 265)"], tint: "oklch(0.2 0.09 268)", tintOpacity: 0.38,
    beam: 0.1, beamColor: "oklch(0.75 0.06 250)", lampBoost: 1,
    backdrop: "radial-gradient(120% 80% at 50% 0%, oklch(0.3 0.07 265) 0%, oklch(0.16 0.04 250) 60%, oklch(0.13 0.03 200) 100%)",
  };
  if (hour < 7) return {
    phase: "dawn", sky: ["oklch(0.7 0.1 30)", "oklch(0.86 0.09 75)"], tint: "oklch(0.7 0.12 55)", tintOpacity: 0.12,
    beam: 0.28, beamColor: "oklch(0.88 0.11 70)", lampBoost: 0.4,
    backdrop: "radial-gradient(120% 80% at 50% 0%, oklch(0.5 0.09 50) 0%, oklch(0.26 0.05 160) 65%, oklch(0.19 0.035 165) 100%)",
  };
  if (hour < 16) return {
    phase: "day", sky: ["oklch(0.72 0.11 235)", "oklch(0.88 0.06 210)"], tint: "oklch(0.95 0.03 90)", tintOpacity: 0,
    beam: 0.38, beamColor: "oklch(0.96 0.08 92)", lampBoost: 0,
    backdrop: "radial-gradient(120% 80% at 50% 0%, oklch(0.5 0.08 150) 0%, oklch(0.28 0.06 160) 60%, oklch(0.2 0.035 165) 100%)",
  };
  return {
    phase: "dusk", sky: ["oklch(0.55 0.15 25)", "oklch(0.8 0.13 65)"], tint: "oklch(0.6 0.15 40)", tintOpacity: 0.16,
    beam: 0.3, beamColor: "oklch(0.82 0.14 55)", lampBoost: 0.6,
    backdrop: "radial-gradient(120% 80% at 50% 0%, oklch(0.5 0.12 40) 0%, oklch(0.26 0.06 150) 62%, oklch(0.18 0.035 165) 100%)",
  };
}

/** Full-scene colour grade overlay, rendered last inside the room SVG. */
export function DayNightLighting({ light, w, h }: { light: Light; w: number; h: number }) {
  return (
    <g pointerEvents="none">
      {light.tintOpacity > 0 && <rect width={w} height={h} fill={light.tint} opacity={light.tintOpacity} style={{ mixBlendMode: "multiply" }} />}
      <rect width={w} height={h} fill="url(#vignette)" />
    </g>
  );
}
