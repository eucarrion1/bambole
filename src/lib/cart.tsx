import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    image_url: string | null;
    stock: number;
  };
}

interface CartCtx {
  items: CartItem[];
  loading: boolean;
  count: number;
  subtotal: number;
  addItem: (productId: string, qty?: number) => Promise<void>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<CartCtx>({} as CartCtx);
const GUEST_KEY = "bambole_guest_cart";

function loadGuest(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]"); } catch { return []; }
}
function saveGuest(items: CartItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    if (!user) {
      const g = loadGuest();
      if (g.length === 0) { setItems([]); return; }
      const ids = g.map((i) => i.product_id);
      const { data } = await supabase.from("products").select("id,name,slug,price,sale_price,image_url,stock").in("id", ids);
      setItems(g.map((gi) => ({ ...gi, product: data?.find((p) => p.id === gi.product_id) as any })));
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("id,product_id,quantity,product:products(id,name,slug,price,sale_price,image_url,stock)")
      .eq("user_id", user.id);
    setItems((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user?.id]);

  // merge guest cart on login
  useEffect(() => {
    if (!user) return;
    const guest = loadGuest();
    if (guest.length === 0) return;
    (async () => {
      for (const g of guest) {
        await supabase.from("cart_items").upsert(
          { user_id: user.id, product_id: g.product_id, quantity: g.quantity },
          { onConflict: "user_id,product_id,variant_id" } as any
        );
      }
      localStorage.removeItem(GUEST_KEY);
      refresh();
    })();
    // eslint-disable-next-line
  }, [user?.id]);

  async function addItem(productId: string, qty = 1) {
    if (!user) {
      const g = loadGuest();
      const ex = g.find((i) => i.product_id === productId);
      if (ex) ex.quantity += qty;
      else g.push({ id: `guest-${productId}`, product_id: productId, quantity: qty });
      saveGuest(g);
      await refresh();
      toast.success("Produto adicionado ao carrinho");
      return;
    }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: qty });
    }
    await refresh();
    toast.success("Produto adicionado ao carrinho");
  }

  async function updateQty(itemId: string, qty: number) {
    if (qty < 1) return removeItem(itemId);
    if (!user) {
      const g = loadGuest();
      const it = g.find((i) => i.id === itemId);
      if (it) { it.quantity = qty; saveGuest(g); await refresh(); }
      return;
    }
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", itemId);
    await refresh();
  }

  async function removeItem(itemId: string) {
    if (!user) {
      saveGuest(loadGuest().filter((i) => i.id !== itemId));
      await refresh();
      return;
    }
    await supabase.from("cart_items").delete().eq("id", itemId);
    await refresh();
  }

  async function clear() {
    if (!user) { localStorage.removeItem(GUEST_KEY); setItems([]); return; }
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  }

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => {
    const p = i.product; if (!p) return s;
    const price = Number(p.sale_price ?? p.price);
    return s + price * i.quantity;
  }, 0);

  const value = useMemo(() => ({ items, loading, count, subtotal, addItem, updateQty, removeItem, clear, refresh }), [items, loading, count, subtotal]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);
