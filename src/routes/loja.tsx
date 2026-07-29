import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { useAllProducts, useCategories } from "@/lib/catalog";
import { resolveProductImage } from "@/lib/product-image";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { ShoppingBag, Search } from "lucide-react";

export const Route = createFileRoute("/loja")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) || "",
    cat: (s.cat as string) || "",
    promo: s.promo ? 1 : 0,
    sort: (s.sort as string) || "relevance",
  }),
  component: LojaPage,
  head: () => ({ meta: [{ title: "Loja — Bambolê Prudente" }] }),
});

function LojaPage() {
  const search = Route.useSearch();
  const { data: products, isLoading } = useAllProducts();
  const { data: categories } = useCategories();
  const { addItem } = useCart();
  const [q, setQ] = useState(search.q);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (search.cat) list = list.filter((p) => categories?.find((c) => c.id === p.category_id)?.slug === search.cat);
    if (search.promo) list = list.filter((p) => p.sale_price);
    if (search.sort === "price-asc") list = [...list].sort((a, b) => Number(a.sale_price ?? a.price) - Number(b.sale_price ?? b.price));
    if (search.sort === "price-desc") list = [...list].sort((a, b) => Number(b.sale_price ?? b.price) - Number(a.sale_price ?? a.price));
    if (search.sort === "rating") list = [...list].sort((a, b) => Number(b.rating) - Number(a.rating));
    return list;
  }, [products, q, search.cat, search.promo, search.sort, categories]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Catálogo</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Nossa loja</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} produtos encontrados</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…"
                className="h-10 pl-9 pr-4 rounded-full bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
            </div>
            <select defaultValue={search.sort} onChange={(e) => { const u = new URL(window.location.href); u.searchParams.set("sort", e.target.value); window.location.href = u.toString(); }}
              className="h-10 px-3 rounded-full bg-muted text-sm focus:outline-none">
              <option value="relevance">Relevância</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="rating">Mais avaliados</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          <Link to="/loja" className={`px-4 h-9 rounded-full text-sm font-semibold grid place-items-center shrink-0 ${!search.cat ? "bg-foreground text-background" : "bg-muted"}`}>Todos</Link>
          {categories?.map((c) => (
            <Link key={c.id} to="/loja" search={{ cat: c.slug } as any} className={`px-4 h-9 rounded-full text-sm font-semibold grid place-items-center shrink-0 ${search.cat === c.slug ? "bg-foreground text-background" : "bg-muted"}`}>
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-3xl bg-muted aspect-[3/4] animate-pulse" />)
            : filtered.map((p) => {
                const price = Number(p.sale_price ?? p.price);
                const old = Number(p.price);
                const off = p.sale_price ? Math.round(((old - price) / old) * 100) : 0;
                return (
                  <article key={p.id} className="group rounded-3xl bg-card border border-border overflow-hidden shadow-card hover:shadow-pop transition-all hover:-translate-y-1">
                    <Link to="/produto/$slug" params={{ slug: p.slug }} className="relative block aspect-square bg-muted overflow-hidden">
                      <img src={resolveProductImage(p.image_url)} loading="lazy" alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {off > 0 && <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-foreground text-background text-[11px] font-bold">-{off}%</span>}
                    </Link>
                    <div className="p-4">
                      <Link to="/produto/$slug" params={{ slug: p.slug }} className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] hover:text-primary">{p.name}</Link>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display text-lg font-bold text-primary">{formatBRL(price)}</span>
                        {off > 0 && <span className="text-xs text-muted-foreground line-through">{formatBRL(old)}</span>}
                      </div>
                      <button onClick={() => addItem(p.id)} className="mt-3 w-full h-10 rounded-full bg-foreground text-background text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary transition-colors">
                        <ShoppingBag className="w-4 h-4" /> Adicionar
                      </button>
                    </div>
                  </article>
                );
              })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
