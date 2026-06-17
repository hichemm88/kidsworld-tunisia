"use client";

import { useEffect, useRef } from "react";

export interface MapPin {
  id: string | number;
  lat: number;
  lng: number;
  name: string;
  category?: string;
  premium?: boolean;
  rating?: number;
  slug?: string;
}

interface MapViewProps {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onPinClick?: (pin: MapPin) => void;
  selectedId?: string | number | null;
}

const CAT_COLORS: Record<string, string> = {
  sante: "#16a34a",
  education: "#7C3AED",
  loisirs: "#2563EB",
  ateliers: "#DC2626",
  fetes: "#DB2777",
  shopping: "#0891B2",
  default: "#F26522",
};

export default function MapView({
  pins,
  center = [36.8065, 10.1815],
  zoom = 12,
  height = "400px",
  onPinClick,
  selectedId,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Import CSS + Leaflet together to avoid CSS race condition
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css" as any),
    ]).then(([L]) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default icon issue with Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Force invalidate size after mount (fixes white tile issue)
      setTimeout(() => {
        map.invalidateSize();
        renderMarkers(L, map);
      }, 100);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      renderMarkers(L, mapInstanceRef.current);
      mapInstanceRef.current.invalidateSize();
    });
  }, [pins, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  function renderMarkers(L: any, map: any) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pins.forEach((pin) => {
      const color = CAT_COLORS[pin.category ?? "default"] ?? CAT_COLORS.default;
      const isSelected = pin.id === selectedId;
      const size = isSelected ? 44 : 36;

      const svgIcon = L.divIcon({
        html: `
          <div style="
            width:${size}px;height:${size}px;
            background:${pin.premium ? "#F5C518" : color};
            border:3px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.8)"};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 4px 12px rgba(0,0,0,${isSelected ? "0.4" : "0.2"});
            display:flex;align-items:center;justify-content:center;cursor:pointer;
          ">
            <div style="transform:rotate(45deg);font-size:${isSelected ? "18px" : "14px"};">
              ${getCategoryLabel(pin.category)}
            </div>
          </div>`,
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: svgIcon });

      const popupContent = `
        <div style="font-family:sans-serif;min-width:180px;padding:4px;">
          <p style="font-size:14px;font-weight:800;color:#111827;margin:0 0 4px;">${pin.name}</p>
          ${pin.rating ? `<p style="font-size:12px;color:#F5C518;font-weight:700;margin:0 0 6px;">★ ${pin.rating}</p>` : ""}
          ${pin.slug ? `<a href="/listing/${pin.slug}" style="font-size:12px;color:#F26522;font-weight:700;text-decoration:none;">Voir la fiche →</a>` : ""}
        </div>`;

      marker.bindPopup(popupContent, { maxWidth: 220 });
      marker.on("click", () => onPinClick?.(pin));
      marker.addTo(map);
      markersRef.current.push(marker);

      if (isSelected) setTimeout(() => marker.openPopup(), 100);
    });

    if (pins.length > 1 && markersRef.current.length > 0) {
      try {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.15));
      } catch { /* ignore */ }
    }
  }

  function getCategoryLabel(cat?: string): string {
    const labels: Record<string, string> = {
      sante: "♥", education: "✦", loisirs: "⚡",
      ateliers: "✏", fetes: "✿", shopping: "◆",
    };
    return labels[cat ?? ""] ?? "●";
  }

  return (
    <div className="relative rounded-2xl border border-black/10 shadow-md" style={{ overflow: "hidden", isolation: "isolate" }}>
      <div
        ref={mapRef}
        style={{ height, width: "100%", background: "#e8edf5" }}
      />
    </div>
  );
}
