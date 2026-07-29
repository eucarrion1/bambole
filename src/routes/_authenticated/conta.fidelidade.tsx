import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta/fidelidade")({
  component: FidPage,
});

function FidPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["loyalty", user?.id],
    queryFn: async () => (await supabase.from("loyalty_points").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });
  const total = (data ?? []).reduce((s, p) => s + p.points, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Pontos & Cashback</h1>
      <div className="rounded-3xl bg-gradient-to-br from-brand-yellow to-brand-pink text-primary-foreground p-6">
        <Star className="w-8 h-8" />
        <div className="text-sm opacity-90 mt-2">Seu saldo</div>
        <div className="font-display text-5xl font-bold">{total} pts</div>
        <p className="text-sm opacity-90 mt-2">Acumule 1 ponto a cada R$1 e use como desconto nas próximas compras.</p>
      </div>

      <h2 className="mt-6 font-semibold">Extrato</h2>
      <div className="mt-2 space-y-2">
        {data?.length === 0 ? <div className="text-muted-foreground">Nenhuma movimentação ainda.</div> :
         data?.map((p) => (
          <div key={p.id} className="rounded-xl bg-card border border-border p-3 flex justify-between text-sm">
            <div><div className="font-semibold capitalize">{p.reason}</div><div className="text-xs text-muted-foreground">{formatDateTime(p.created_at)}</div></div>
            <div className={`font-bold ${p.points >= 0 ? "text-success" : "text-destructive"}`}>{p.points >= 0 ? "+" : ""}{p.points} pts</div>
          </div>
         ))}
      </div>
    </div>
  );
}
