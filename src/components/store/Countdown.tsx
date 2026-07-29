import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStoreSettings } from "@/lib/store-settings";

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, target - now);
  const s = Math.floor(diff / 1000);
  return {
    h: String(Math.floor(s / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
    ended: diff === 0,
  };
}

export function Countdown() {
  const { data: settings } = useStoreSettings();

  const target = useMemo(() => {
    if (settings?.promo_ends_at) {
      const t = new Date(settings.promo_ends_at).getTime();
      if (!Number.isNaN(t)) return t;
    }
    return Date.now() + 1000 * 60 * 60 * 8;
  }, [settings?.promo_ends_at]);

  const { h, m, s, ended } = useCountdown(target);

  if (settings && settings.promo_active === false) return null;
  if (ended) return null;

  const title = settings?.promo_title || "Até 60% off em brinquedos";
  const subtitle = settings?.promo_subtitle || "Corre que acaba! Os preços mais doces da temporada estão por tempo limitadíssimo.";
  const badge = settings?.promo_badge || "🔥 Oferta relâmpago";
  const ctaLabel = settings?.promo_cta_label || "Aproveitar →";
  const ctaLink = settings?.promo_cta_link || "/loja?promo=1";

  return (
    <section id="ofertas" className="mx-auto max-w-7xl px-4 py-12">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-brand text-primary-foreground p-8 md:p-12 shadow-pop">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/15 blur-2xl" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              {badge}
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">{title}</h2>
            <p className="mt-2 text-primary-foreground/90 max-w-md">{subtitle}</p>
            <Link to={ctaLink as any} className="inline-block mt-5 h-11 px-6 rounded-full bg-card text-foreground font-semibold leading-[2.75rem] shadow-card hover:scale-105 transition-transform">
              {ctaLabel}
            </Link>
          </div>
          <div className="flex gap-3 md:gap-4 justify-center md:justify-end">
            {[
              ["Horas", h],
              ["Minutos", m],
              ["Segundos", s],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-card/95 text-foreground px-4 py-3 md:px-6 md:py-4 min-w-[80px] md:min-w-[100px] text-center shadow-card">
                <div className="font-display text-3xl md:text-5xl font-bold tabular-nums text-primary">{v}</div>
                <div className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
