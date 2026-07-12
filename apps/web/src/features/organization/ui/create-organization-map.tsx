import L from "leaflet";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { cn } from "@autolab/ui/lib/utils";

import "leaflet/dist/leaflet.css";

type Props = {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
};

const mapStyles = {
  light: {
    tiles: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    tiles: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

const customIcon = new L.Icon({
  iconUrl: "/icons/map-pin.svg",
  iconSize: [25, 30],
  iconAnchor: [12, 30],
  popupAnchor: [1, -34],
});

export const CreateOrganizationMap = ({ onLocationSelect, initialLocation, className }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const [selectedLocation, setSelectedLocation] = useState<L.LatLng | null>(null);
  const { resolvedTheme } = useTheme();

  onLocationSelectRef.current = onLocationSelect;

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [50.4501, 30.5234],
      zoom: 6,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    const theme = resolvedTheme === "dark" ? "dark" : "light";
    const currentStyle = mapStyles[theme];
    tileLayerRef.current = L.tileLayer(currentStyle.tiles, {
      attribution: currentStyle.attribution,
      subdomains: "abcd",
      className: theme === "dark" ? "dark-map-tiles" : "",
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const currentMap = mapInstanceRef.current;
      if (!currentMap) return;

      const { lat, lng } = e.latlng;
      setSelectedLocation(e.latlng);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(currentMap);
      }

      currentMap.setView([lat, lng], currentMap.getZoom(), {
        animate: true,
        duration: 0.5,
        noMoveStart: true,
      });

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=uk`,
        );
        const data = await response.json();
        const address = data.display_name || "Адресу не знайдено";
        onLocationSelectRef.current(lat, lng, address);
      } catch {
        onLocationSelectRef.current(lat, lng, "Помилка при отриманні адреси");
      }
    };

    map.on("click", handleMapClick);

    const style = document.createElement("style");
    style.textContent = `
      .dark-map-tiles {
        filter: brightness(0.8) invert(1) contrast(1.1) hue-rotate(180deg) saturate(0.5);
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.off("click", handleMapClick);
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markerRef.current = null;
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !initialLocation) return;

    const { lat, lng } = initialLocation;
    const latLng = L.latLng(lat, lng);
    setSelectedLocation(latLng);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.setView([lat, lng], 14, { animate: false });
  }, [initialLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const theme = resolvedTheme === "dark" ? "dark" : "light";
    const currentStyle = mapStyles[theme];

    tileLayerRef.current.remove();
    tileLayerRef.current = L.tileLayer(currentStyle.tiles, {
      attribution: currentStyle.attribution,
      subdomains: "abcd",
      className: theme === "dark" ? "dark-map-tiles" : "",
    }).addTo(mapInstanceRef.current);
  }, [resolvedTheme]);

  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.setView(
        [selectedLocation.lat, selectedLocation.lng],
        mapInstanceRef.current.getZoom(),
      );
    }
  }, [selectedLocation]);

  return <div ref={mapRef} className={cn("h-48 w-full", className)} />;
};
