import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatBRL, formatDateTime } from "@/lib/format";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta/pedidos")({
  component: PedidosPage,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendente", cls: "bg-brand-yellow/20 text-foreground" },
  paid: { label: "Pago", cls: "bg-success/20 text-success" },
  processing: { label: "Em separação", cls: "bg-brand-cyan/20 text-foreground" },
  shipped: { label: "Enviado", cls: "bg-brand-blue/20 text-foreground" },
  delivered: { label: "Entregue", cls: "bg-success/20 text-success" },
  cancelled: { label: "Cancelado", cls: "bg-destructive/20 text-destructive" },
  refunded: { label: "Reembolsado", cls: "bg-muted text-muted-foreground" },
};

function PedidosPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Meus pedidos</h1>
      {isLoading ? <div className="text-muted-foreground">Carregando…</div> :
       data?.length === 0 ? (
         <div className="rounded-3xl bg-card border border-border p-10 text-center">
           <Package className="w-10 h-10 mx-auto text-muted-foreground" />
           <p className="mt-3 text-muted-foreground">Você ainda não fez nenhum pedido.</p>
         </div>
       ) : (
         <div className="space-y-3">
           {data?.map((o: any) => (
             <div key={o.id} className="rounded-2xl bg-card border border-border p-4">
               <div className="flex flex-wrap justify-between gap-2">
                 <div>
                   <div className="font-semibold">#{o.order_number}</div>
                   <div className="text-xs text-muted-foreground">{formatDateTime(o.created_at)}</div>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS[o.status]?.cls}`}>{STATUS[o.status]?.label}</span>
               </div>
               <div className="mt-3 grid sm:grid-cols-[1fr_auto] gap-2 items-end">
                 <div className="text-sm text-muted-foreground">{o.order_items?.length} {o.order_items?.length === 1 ? "item" : "itens"} • {o.payment_method?.toUpperCase()}</div>
                 <div className="font-display text-xl font-bold text-primary">{formatBRL(Number(o.total))}</div>
               </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}
