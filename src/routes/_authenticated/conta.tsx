import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";
import { Package, Heart, Star, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta")({
  component: ContaPage,
});

function ContaPage() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });
  const { data: stats } = useQuery({
    queryKey: ["stats", user?.id],
    queryFn: async () => {
      const [orders, fav, points] = await Promise.all([
        supabase.from("orders").select("id,total", { count: "exact" }).eq("user_id", user!.id),
        supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("loyalty_points").select("points").eq("user_id", user!.id),
      ]);
      const totalSpent = (orders.data ?? []).reduce((s, o) => s + Number(o.total), 0);
      const totalPoints = (points.data ?? []).reduce((s, p) => s + p.points, 0);
      return { orderCount: orders.count ?? 0, favCount: fav.count ?? 0, totalSpent, totalPoints };
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-brand-magenta to-brand-pink text-primary-foreground p-6">
        <p className="text-sm opacity-90">Bem-vindo de volta</p>
        <h1 className="font-display text-3xl font-bold">{profile?.full_name || user?.email}</h1>
        <p className="text-sm mt-1 opacity-90">Seu clube Bambolê tem benefícios exclusivos.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { i: Package, l: "Pedidos", v: stats?.orderCount ?? 0 },
          { i: Heart, l: "Favoritos", v: stats?.favCount ?? 0 },
          { i: Star, l: "Pontos", v: stats?.totalPoints ?? 0 },
          { i: Wallet, l: "Total gasto", v: formatBRL(stats?.totalSpent ?? 0) },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-card border border-border p-4">
            <s.i className="w-5 h-5 text-primary" />
            <div className="mt-2 text-xs text-muted-foreground">{s.l}</div>
            <div className="text-2xl font-bold">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-card border border-border p-6">
        <h2 className="font-semibold text-lg mb-4">Meus dados</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><div className="text-muted-foreground">Nome</div><div className="font-semibold">{profile?.full_name || "—"}</div></div>
          <div><div className="text-muted-foreground">E-mail</div><div className="font-semibold">{user?.email}</div></div>
          <div><div className="text-muted-foreground">Telefone</div><div className="font-semibold">{profile?.phone || "—"}</div></div>
          <div><div className="text-muted-foreground">CPF</div><div className="font-semibold">{profile?.cpf || "—"}</div></div>
        </div>
      </div>
    </div>
  );
}
