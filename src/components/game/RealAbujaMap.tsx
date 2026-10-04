import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { DISTRICTS } from "@/game/content";

/** Approximate real-world centres of each district (OpenStreetMap coordinates). */
export const DISTRICT_LATLNG: Record<string, [number, number]> = {
  cbd: [9.0563, 7.4985], wuse: [9.0717, 7.4730], wuse2: [9.0802, 7.4720], garki: [9.0370, 7.4890],
  maitama: [9.0935, 7.4950], asokoro: [9.0440, 7.5300], jabi: [9.0700, 7.4200], utako: [9.0700, 7.4430],
  gwarinpa: [9.1100, 7.4050], lifecamp: [9.0790, 7.4000], mabushi: [9.0830, 7.4560], kado: [9.0880, 7.4400],
  jahi: [9.0950, 7.4600], katampe: [9.1150, 7.4700], apo: [8.9970, 7.4950], lokogoma: [8.9850, 7.4600],
  galadimawa: [8.9980, 7.4350], lugbe: [8.9800, 7.3800], kubwa: [9.1550, 7.3300],
};

export default function RealAbujaMap({ current, selected, onSelect }: { current: string; selected: string | null; onSelect: (id: string) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<import("leaflet").Map | null>(null);
  const layer = useRef<import("leaflet").LayerGroup | null>(null);
  const cb = useRef(onSelect);
  cb.current = onSelect;

  useEffect(() => {
    let alive = true;
    import("leaflet").then((L) => {
      if (!alive || !el.current || map.current) return;
      map.current = L.map(el.current, { zoomControl: false, attributionControl: true }).setView([9.06, 7.46], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18, attribution: "© OpenStreetMap contributors",
      }).addTo(map.current);
      L.control.zoom({ position: "bottomright" }).addTo(map.current);
      layer.current = L.layerGroup().addTo(map.current);
      draw(L);
    });
    return () => { alive = false; map.current?.remove(); map.current = null; };
  }, []);

  const draw = (L: typeof import("leaflet")) => {
    if (!layer.current) return;
    layer.current.clearLayers();
    for (const d of DISTRICTS) {
      const ll = DISTRICT_LATLNG[d.id]; if (!ll) continue;
      const me = d.id === current, sel = d.id === selected;
      const icon = L.divIcon({
        className: "",
        iconSize: [0, 0],
        html: `<div class="osm-pin ${me ? "osm-pin-me" : ""} ${sel ? "osm-pin-sel" : ""}">${me ? "★ " : ""}${d.name}</div>`,
      });
      L.marker(ll, { icon }).on("click", () => cb.current(d.id)).addTo(layer.current);
    }
  };

  useEffect(() => {
    import("leaflet").then((L) => {
      draw(L);
      const ll = selected ? DISTRICT_LATLNG[selected] : null;
      if (ll && map.current) map.current.flyTo(ll, 14, { duration: 0.8 });
    });
  }, [current, selected]);

  return <div ref={el} className="absolute inset-0 z-0" />;
}
