import { ArrowRight, Sparkles } from "lucide-react";
import hero from "@/assets/hero-products.jpg";
import { useStoreSettings } from "@/lib/store-settings";

export function Hero() {
  const { data: s } = useStoreSettings();
  const badge = s?.hero_badge || "Coleção Primavera 2026";
  const title = s?.hero_title || "Tudo pro seu pequeno com muito carinho.";
  const subtitle = s?.hero_subtitle || "Roupinhas, brinquedos e enxoval com curadoria das melhores marcas — entrega rápida em todo Brasil e parcelamento em até 12x.";
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-cyan/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-10 w-96 h-96 rounded-full bg-brand-magenta/25 blur-3xl" />
      <div className="absolute top-10 right-1/3 w-6 h-6 rounded-full bg-brand-yellow animate-float" />
      <div className="absolute bottom-20 left-1/4 w-4 h-4 rounded-full bg-brand-magenta animate-float [animation-delay:1s]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-semibold shadow-card">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> {badge}
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-[1.05]">{title}</h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#produtos" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gradient-pill text-primary-foreground font-semibold shadow-pop hover:scale-[1.03] transition-transform">
              Comprar agora <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#categorias" className="inline-flex items-center h-12 px-6 rounded-full bg-card border border-border font-semibold hover:bg-muted transition-colors">
              Ver categorias
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              ["+10k", "clientes felizes"],
              ["4.9★", "avaliação média"],
              ["24h", "envio expresso"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-display text-2xl font-bold text-gradient-brand">{k}</dt>
                <dd className="text-xs text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -m-6 rounded-[2.5rem] bg-gradient-pill blur-2xl opacity-30" />
          <div className="relative rounded-[2rem] overflow-hidden shadow-pop border-4 border-card">
            <img src={hero} alt="Produtos infantis Bambolê" width={1280} height={1024} className="w-full h-auto object-cover" />
          </div>
          <div className="absolute -left-4 top-8 bg-card rounded-2xl shadow-card px-4 py-3 flex items-center gap-3 animate-float">
            <div className="w-9 h-9 rounded-full bg-brand-yellow grid place-items-center">🎁</div>
            <div className="text-xs">
              <div className="font-bold">Cashback 5%</div>
              <div className="text-muted-foreground">em todo site</div>
            </div>
          </div>
          <div className="absolute -right-2 bottom-6 bg-card rounded-2xl shadow-card px-4 py-3 flex items-center gap-3 animate-float [animation-delay:1.5s]">
            <div className="w-9 h-9 rounded-full bg-brand-cyan grid place-items-center">🚚</div>
            <div className="text-xs">
              <div className="font-bold">Frete grátis</div>
              <div className="text-muted-foreground">acima de R$ 199</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
