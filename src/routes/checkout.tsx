import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { resolveProductImage } from "@/lib/product-image";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { CreditCard, QrCode, Receipt } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — Bambolê Prudente" }] }),
});

function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState({ recipient: "", zip: "", street: "", number: "", complement: "", district: "", city: "", state: "" });
  const [payment, setPayment] = useState<"pix" | "credit_card" | "boleto">("pix");
  const [processing, setProcessing] = useState(false);

  const shipping = subtotal > 199 || subtotal === 0 ? 0 : 19.9;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { tab: "login", redirect: "/checkout" } as any });
  }, [loading, user, navigate]);

  async function submitOrder() {
    if (!user) return;
    if (items.length === 0) return toast.error("Carrinho vazio");
    setProcessing(true);
    try {
      const points_earned = Math.floor(total * 0.05);
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id,
        status: payment === "pix" ? "paid" : "pending",
        payment_method: payment,
        subtotal, shipping, discount: 0, total,
        shipping_address: address,
        billing_address: address,
        points_earned,
        paid_at: payment === "pix" ? new Date().toISOString() : null,
      }).select().single();
      if (error) throw error;

      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.product!.name,
        product_image: i.product!.image_url,
        unit_price: Number(i.product!.sale_price ?? i.product!.price),
        quantity: i.quantity,
        subtotal: Number(i.product!.sale_price ?? i.product!.price) * i.quantity,
      }));
      await supabase.from("order_items").insert(orderItems);

      if (points_earned > 0) {
        await supabase.from("loyalty_points").insert({ user_id: user.id, points: points_earned, reason: "compra", order_id: order.id });
      }
      await supabase.from("notifications").insert({ user_id: user.id, type: "success", title: "Pedido recebido!", body: `Pedido ${order.order_number} foi confirmado.`, link: `/conta/pedidos` });

      await clear();
      toast.success("Pedido realizado com sucesso! 🎉");
      navigate({ to: "/conta/pedidos" });
    } catch (e: any) {
      toast.error(e.message || "Erro ao processar pedido");
    } finally { setProcessing(false); }
  }

  if (loading) return <div className="min-h-screen grid place-items-center">Carregando…</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Finalizar compra</h1>
        <div className="mt-4 flex gap-2 text-sm">
          {[{ n: 1, l: "Endereço" }, { n: 2, l: "Pagamento" }, { n: 3, l: "Confirmação" }].map((s) => (
            <div key={s.n} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${step >= s.n ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <span className="w-5 h-5 rounded-full bg-background/30 grid place-items-center text-xs font-bold">{s.n}</span>{s.l}
            </div>
          ))}
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="rounded-3xl bg-card border border-border p-6">
            {step === 1 && (
              <>
                <h2 className="font-semibold text-lg mb-4">Endereço de entrega</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[["recipient", "Nome completo"], ["zip", "CEP"], ["street", "Rua"], ["number", "Número"], ["complement", "Complemento"], ["district", "Bairro"], ["city", "Cidade"], ["state", "UF"]].map(([k, l]) => (
                    <input key={k} placeholder={l} value={(address as any)[k]} onChange={(e) => setAddress((a) => ({ ...a, [k]: e.target.value }))}
                      className="h-11 px-4 rounded-xl bg-muted focus:bg-background border border-transparent focus:border-ring focus:outline-none text-sm" />
                  ))}
                </div>
                <button disabled={!address.recipient || !address.zip || !address.street || !address.city} onClick={() => setStep(2)} className="mt-4 px-6 h-11 rounded-full bg-gradient-pill text-primary-foreground font-semibold disabled:opacity-50">Continuar →</button>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="font-semibold text-lg mb-4">Forma de pagamento</h2>
                <div className="space-y-2">
                  {[{ v: "pix", l: "PIX (5% off)", i: <QrCode className="w-5 h-5" /> }, { v: "credit_card", l: "Cartão de crédito (até 12x)", i: <CreditCard className="w-5 h-5" /> }, { v: "boleto", l: "Boleto bancário", i: <Receipt className="w-5 h-5" /> }].map((opt) => (
                    <label key={opt.v} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer ${payment === opt.v ? "border-primary bg-primary/5" : "border-border"}`}>
                      <input type="radio" name="payment" checked={payment === opt.v} onChange={() => setPayment(opt.v as any)} className="accent-primary" />
                      {opt.i}<span className="font-semibold">{opt.l}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setStep(1)} className="px-6 h-11 rounded-full bg-muted font-semibold">← Voltar</button>
                  <button onClick={() => setStep(3)} className="px-6 h-11 rounded-full bg-gradient-pill text-primary-foreground font-semibold">Revisar pedido →</button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="font-semibold text-lg mb-4">Revise e confirme</h2>
                <div className="text-sm space-y-2">
                  <p><strong>Entrega:</strong> {address.recipient}, {address.street}, {address.number} — {address.city}/{address.state}</p>
                  <p><strong>Pagamento:</strong> {payment === "pix" ? "PIX" : payment === "credit_card" ? "Cartão de crédito" : "Boleto"}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setStep(2)} className="px-6 h-11 rounded-full bg-muted font-semibold">← Voltar</button>
                  <button disabled={processing} onClick={submitOrder} className="flex-1 h-11 rounded-full bg-gradient-pill text-primary-foreground font-semibold disabled:opacity-60">
                    {processing ? "Processando…" : `Confirmar pedido — ${formatBRL(total)}`}
                  </button>
                </div>
              </>
            )}
          </div>

          <aside className="rounded-3xl bg-card border border-border p-6 h-fit">
            <h3 className="font-semibold">Resumo</h3>
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex gap-2 text-sm">
                  <img src={resolveProductImage(i.product?.image_url || null)} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0"><div className="line-clamp-1">{i.product?.name}</div><div className="text-muted-foreground">{i.quantity}x</div></div>
                  <div className="font-semibold">{formatBRL(Number(i.product?.sale_price ?? i.product?.price) * i.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{shipping === 0 ? "Grátis" : formatBRL(shipping)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-1"><span>Total</span><span className="text-primary">{formatBRL(total)}</span></div>
              <div className="text-xs text-success">Você ganhará {Math.floor(total * 0.05)} pontos de fidelidade ⭐</div>
            </div>
            <Link to="/carrinho" className="block text-center mt-3 text-xs text-muted-foreground hover:text-foreground">Editar carrinho</Link>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
