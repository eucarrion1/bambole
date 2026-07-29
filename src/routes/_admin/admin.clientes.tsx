import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_admin/admin/clientes")({
  component: AdminClientes,
});

function AdminClientes() {
  const { data } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Clientes (CRM)</h1>
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>
            <th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Telefone</th><th className="p-3">Pontos</th><th className="p-3">Cadastro</th>
          </tr></thead>
          <tbody>
            {data?.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-semibold">{c.full_name || "—"}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone || "—"}</td>
                <td className="p-3">{c.loyalty_balance}</td>
                <td className="p-3 text-muted-foreground">{formatDateTime(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
