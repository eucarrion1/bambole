import { Heart, Star, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useFeaturedProducts } from "@/lib/catalog";
import { resolveProductImage } from "@/lib/product-image";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/lib/cart";

export function Products() {
  const { data: products, isLoading } = useFeaturedProducts();
  const { addItem } = useCart();

  return (
    <section id="produtos" className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Vitrine</p>
          <h2 className="text-3xl md:text-4xl font-bold mt-1">Mais amados da semana</h2>
        </div>
        <Link to="/loja" className="hidden sm:inline text-sm font-semibold text-primary hover:underline">
          Ver todos →
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-muted aspect-[3/4] animate-pulse" />
            ))
          : products?.map((p) => {
              const price = Number(p.sale_price ?? p.price);
              const old = Number(p.price);
              const off = p.sale_price ? Math.round(((old - price) / old) * 100) : 0;
              return (
                <article key={p.id} className="group rounded-3xl bg-card border border-border overflow-hidden shadow-card hover:shadow-pop transition-all hover:-translate-y-1">
                  <Link to="/produto/$slug" params={{ slug: p.slug }} className="relative block aspect-square overflow-hidden bg-muted">
                    <img src={resolveProductImage(p.image_url)} loading="lazy" alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.tag && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-pill text-primary-foreground text-[10px] font-bold uppercase tracking-wider">{p.tag}</span>}
                    {off > 0 && <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-foreground text-background text-[11px] font-bold">-{off}%</span>}
                    <span className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-card grid place-items-center shadow-card"><Heart className="w-4 h-4" /></span>
                  </Link>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
                      <span className="font-semibold text-foreground">{Number(p.rating).toFixed(1)}</span>
                      <span>({p.reviews_count})</span>
                    </div>
                    <Link to="/produto/$slug" params={{ slug: p.slug }} className="mt-1 block font-semibold text-sm md:text-base line-clamp-2 min-h-[2.75rem] hover:text-primary">
                      {p.name}
                    </Link>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-lg md:text-xl font-bold text-primary">{formatBRL(price)}</span>
                      {off > 0 && <span className="text-xs text-muted-foreground line-through">{formatBRL(old)}</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground">ou 12x de {formatBRL(price / 12)}</div>
                    <button onClick={() => addItem(p.id)} className="mt-3 w-full h-10 rounded-full bg-foreground text-background text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary transition-colors">
                      <ShoppingBag className="w-4 h-4" /> Adicionar
                    </button>
                  </div>
                </article>
              );
            })}
      </div>
    </section>
  );
}
