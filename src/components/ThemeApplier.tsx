import { useEffect } from "react";
import { useStoreSettings } from "@/lib/store-settings";

// Converts #rrggbb to oklch() approximate — we just pass the hex as a color directly.
// Tailwind v4 with our @theme tokens uses CSS variables, so setting --primary to any valid color works.
export function ThemeApplier() {
  const { data } = useStoreSettings();
  useEffect(() => {
    if (typeof document === "undefined" || !data) return;
    const root = document.documentElement;
    if (data.primary_color) root.style.setProperty("--primary", data.primary_color);
    if (data.accent_color) root.style.setProperty("--accent", data.accent_color);
    if (data.secondary_color) root.style.setProperty("--secondary", data.secondary_color);
  }, [data?.primary_color, data?.accent_color, data?.secondary_color]);
  return null;
}
