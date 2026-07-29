import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/pedidos")({
  component: AdminPedidos,
});

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

function AdminPedidos() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })).data ?? [],
  });
  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Pedidos</h1>
      <div className="rounded-2xl bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>
            <th className="p-3">Pedido</th><th className="p-3">Data</th><th className="p-3">Itens</th><th className="p-3">Pagamento</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th>
          </tr></thead>
          <tbody>
            {data?.map((o: any) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-semibold">#{o.order_number}</td>
                <td className="p-3 text-muted-foreground">{formatDateTime(o.created_at)}</td>
                <td className="p-3">{o.order_items?.length}</td>
                <td className="p-3 uppercase text-xs">{o.payment_method}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="px-2 py-1 rounded-lg bg-muted text-xs focus:outline-none">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 text-right font-bold">{formatBRL(Number(o.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
