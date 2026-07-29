import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { useCart } from "@/lib/cart";
import { resolveProductImage } from "@/lib/product-image";
import { formatBRL } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/carrinho")({
  component: CarrinhoPage,
  head: () => ({ meta: [{ title: "Carrinho — Bambolê Prudente" }] }),
});

function CarrinhoPage() {
  const { items, subtotal, updateQty, removeItem, count } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const shipping = subtotal > 199 || subtotal === 0 ? 0 : 19.9;
  const total = Math.max(0, subtotal + shipping - discount);

  async function applyCoupon() {
    if (!coupon) return;
    const { data } = await supabase.from("coupons").select("*").ilike("code", coupon).eq("is_active", true).maybeSingle();
    if (!data) return toast.error("Cupom inválido");
    if (data.min_order && subtotal < Number(data.min_order)) return toast.error(`Pedido mínimo ${formatBRL(Number(data.min_order))}`);
    const d = data.discount_type === "percent" ? subtotal * (Number(data.discount_value) / 100) : Number(data.discount_value);
    setDiscount(d);
    setCouponCode(data.code);
    toast.success(`Cupom ${data.code} aplicado: -${formatBRL(d)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Meu carrinho</h1>
        <p className="text-sm text-muted-foreground">{count} {count === 1 ? "item" : "itens"}</p>

        {items.length === 0 ? (
          <div className="mt-10 text-center p-12 rounded-3xl bg-card border border-border">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
            <h2 className="mt-4 font-semibold text-lg">Seu carrinho está vazio</h2>
            <p className="text-sm text-muted-foreground">Que tal dar uma olhada nas novidades?</p>
            <Link to="/loja" className="inline-block mt-4 px-6 h-11 rounded-full bg-gradient-pill text-primary-foreground font-semibold leading-[2.75rem]">Ir às compras</Link>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-3">
              {items.map((it) => {
                const p = it.product!;
                const price = Number(p.sale_price ?? p.price);
                return (
                  <div key={it.id} className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
                    <Link to="/produto/$slug" params={{ slug: p.slug }} className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img src={resolveProductImage(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to="/produto/$slug" params={{ slug: p.slug }} className="font-semibold hover:text-primary line-clamp-2">{p.name}</Link>
                      <div className="text-primary font-display font-bold text-lg">{formatBRL(price)}</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="inline-flex items-center bg-muted rounded-full">
                          <button onClick={() => updateQty(it.id, it.quantity - 1)} className="w-8 h-8 grid place-items-center"><Minus className="w-3 h-3" /></button>
                          <span className="w-8 text-center text-sm font-semibold">{it.quantity}</span>
                          <button onClick={() => updateQty(it.id, it.quantity + 1)} className="w-8 h-8 grid place-items-center"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeItem(it.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="text-right font-bold">{formatBRL(price * it.quantity)}</div>
                  </div>
                );
              })}
            </div>

            <aside className="rounded-3xl bg-card border border-border p-6 h-fit sticky top-32">
              <h3 className="font-semibold text-lg">Resumo</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{shipping === 0 ? "Grátis 🎉" : formatBRL(shipping)}</span></div>
                {discount > 0 && <div className="flex justify-between text-success"><span>Cupom {couponCode}</span><span>-{formatBRL(discount)}</span></div>}
                <div className="border-t border-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">{formatBRL(total)}</span></div>
                <p className="text-xs text-muted-foreground">em até 12x de {formatBRL(total / 12)}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Cupom" className="flex-1 h-10 px-3 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={applyCoupon} className="h-10 px-4 rounded-full bg-foreground text-background text-sm font-semibold">Aplicar</button>
              </div>

              <button onClick={() => navigate({ to: "/checkout" })} className="mt-4 w-full h-12 rounded-full bg-gradient-pill text-primary-foreground font-semibold shadow-pop hover:scale-[1.01] transition-transform">
                Finalizar compra →
              </button>
              <Link to="/loja" className="block text-center mt-3 text-sm text-muted-foreground hover:text-foreground">Continuar comprando</Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
