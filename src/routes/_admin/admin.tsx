import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDateTime } from "@/lib/format";
import { TrendingUp, ShoppingCart, Users, Package } from "lucide-react";

export const Route = createFileRoute("/_admin/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, products, customers, revenueRows] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total,status,created_at").in("status", ["paid", "processing", "shipped", "delivered"]),
      ]);
      const revenue = (revenueRows.data ?? []).reduce((s, o) => s + Number(o.total), 0);
      const aov = revenueRows.data?.length ? revenue / revenueRows.data.length : 0;
      return { orders: orders.count ?? 0, products: products.count ?? 0, customers: customers.count ?? 0, revenue, aov };
    },
  });
  const { data: recent } = useQuery({
    queryKey: ["admin-recent"],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10)).data ?? [],
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral da operação</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { i: TrendingUp, l: "Receita total", v: formatBRL(stats?.revenue ?? 0), c: "from-success to-brand-mint" },
          { i: ShoppingCart, l: "Pedidos", v: stats?.orders ?? 0, c: "from-brand-magenta to-brand-pink" },
          { i: Users, l: "Clientes", v: stats?.customers ?? 0, c: "from-brand-cyan to-brand-blue" },
          { i: Package, l: "Ticket médio", v: formatBRL(stats?.aov ?? 0), c: "from-brand-yellow to-brand-pink" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-card border border-border p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.c} grid place-items-center text-primary-foreground`}><s.i className="w-5 h-5" /></div>
            <div className="mt-3 text-xs text-muted-foreground">{s.l}</div>
            <div className="text-2xl font-bold">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">Pedidos recentes</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>
            <th className="p-3">Pedido</th><th className="p-3">Data</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th>
          </tr></thead>
          <tbody>
            {recent?.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-semibold">#{o.order_number}</td>
                <td className="p-3 text-muted-foreground">{formatDateTime(o.created_at)}</td>
                <td className="p-3"><span className="px-2 py-1 rounded-full bg-muted text-xs">{o.status}</span></td>
                <td className="p-3 text-right font-bold">{formatBRL(Number(o.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
