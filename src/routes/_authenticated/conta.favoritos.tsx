import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { resolveProductImage } from "@/lib/product-image";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { Heart, Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta/favoritos")({
  component: FavPage,
});

function FavPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addItem } = useCart();
  const { data } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("wishlists").select("id,product:products(*)").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  async function remove(id: string) {
    await supabase.from("wishlists").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Favoritos</h1>
      {data?.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border p-10 text-center">
          <Heart className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Sua lista de desejos está vazia.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((w: any) => {
            const p = w.product;
            const price = Number(p.sale_price ?? p.price);
            return (
              <div key={w.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                <Link to="/produto/$slug" params={{ slug: p.slug }} className="block aspect-square bg-muted">
                  <img src={resolveProductImage(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                </Link>
                <div className="p-3">
                  <div className="font-semibold text-sm line-clamp-2">{p.name}</div>
                  <div className="text-primary font-bold mt-1">{formatBRL(price)}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => addItem(p.id)} className="flex-1 h-9 rounded-full bg-foreground text-background text-xs font-semibold inline-flex items-center justify-center gap-1"><ShoppingBag className="w-3 h-3" /> Adicionar</button>
                    <button onClick={() => remove(w.id)} className="h-9 w-9 rounded-full bg-muted grid place-items-center text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
