import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { resolveProductImage } from "@/lib/product-image";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { ShoppingBag, Heart, Star, Truck, ShieldCheck, RefreshCcw, Minus, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/produto/$slug")({
  component: ProdutoPage,
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Bambolê Prudente` }] }),
});

function ProdutoPage() {
  const { slug } = Route.useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: async () => {
      const { data } = await supabase.from("product_reviews").select("*").eq("product_id", product!.id).eq("is_approved", true).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!product?.id,
  });

  async function toggleFav() {
    if (!user) return toast.info("Entre para favoritar produtos.");
    if (!product) return;
    await supabase.from("wishlists").upsert({ user_id: user.id, product_id: product.id });
    toast.success("Adicionado aos favoritos");
  }

  if (isLoading) return (
    <div className="min-h-screen bg-background"><Header /><div className="mx-auto max-w-7xl p-8"><div className="grid lg:grid-cols-2 gap-8"><div className="aspect-square rounded-3xl bg-muted animate-pulse" /><div className="space-y-4"><div className="h-8 bg-muted rounded animate-pulse" /><div className="h-32 bg-muted rounded animate-pulse" /></div></div></div><Footer /></div>
  );
  if (!product) return (
    <div className="min-h-screen bg-background"><Header /><div className="mx-auto max-w-3xl p-16 text-center"><h1 className="text-2xl font-bold">Produto não encontrado</h1><Link to="/loja" className="text-primary underline">Voltar à loja</Link></div></div>
  );

  const price = Number(product.sale_price ?? product.price);
  const old = Number(product.price);
  const off = product.sale_price ? Math.round(((old - price) / old) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <nav className="text-xs text-muted-foreground mb-4"><Link to="/" className="hover:text-foreground">Início</Link> / <Link to="/loja" className="hover:text-foreground">Loja</Link> / <span className="text-foreground">{product.name}</span></nav>
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted relative">
              <img src={resolveProductImage(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
              {off > 0 && <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-foreground text-background text-sm font-bold">-{off}%</span>}
            </div>
          </div>
          <div>
            {product.tag && <span className="inline-block px-3 py-1 rounded-full bg-gradient-pill text-primary-foreground text-xs font-bold uppercase">{product.tag}</span>}
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
              <span className="font-semibold">{Number(product.rating).toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviews_count} avaliações)</span>
            </div>
            <p className="mt-4 text-muted-foreground">{product.short_description || product.description}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-primary">{formatBRL(price)}</span>
              {off > 0 && <span className="text-lg text-muted-foreground line-through">{formatBRL(old)}</span>}
            </div>
            <p className="text-sm text-muted-foreground">ou 12x de {formatBRL(price / 12)} sem juros</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center bg-muted rounded-full">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 grid place-items-center"><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 grid place-items-center"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={() => addItem(product.id, qty)} className="flex-1 h-12 rounded-full bg-gradient-pill text-primary-foreground font-semibold shadow-pop hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Adicionar ao carrinho
              </button>
              <button onClick={toggleFav} className="h-12 w-12 rounded-full bg-muted grid place-items-center hover:bg-card"><Heart className="w-5 h-5" /></button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-center">
              <div className="p-3 rounded-2xl bg-muted"><Truck className="w-5 h-5 mx-auto mb-1 text-primary" /> Frete grátis<br /><span className="text-muted-foreground">acima de R$199</span></div>
              <div className="p-3 rounded-2xl bg-muted"><ShieldCheck className="w-5 h-5 mx-auto mb-1 text-primary" /> Compra segura<br /><span className="text-muted-foreground">SSL + Antifraude</span></div>
              <div className="p-3 rounded-2xl bg-muted"><RefreshCcw className="w-5 h-5 mx-auto mb-1 text-primary" /> Troca fácil<br /><span className="text-muted-foreground">em 7 dias</span></div>
            </div>

            <div className="mt-6 text-sm">
              <strong>Estoque:</strong> {product.stock > 0 ? <span className="text-success">{product.stock} unidades disponíveis</span> : <span className="text-destructive">Esgotado</span>}
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-4">Avaliações de clientes</h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-1 mb-1">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />)}</div>
                  {r.title && <h4 className="font-semibold">{r.title}</h4>}
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Seja o primeiro a avaliar este produto.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
