import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/cupons")({
  component: AdminCupons,
});

function AdminCupons() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ code: "", description: "", discount_type: "percent", discount_value: 10, min_order: 0, is_active: true });
  const { data } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  async function add() {
    const { error } = await supabase.from("coupons").insert({ ...form, code: form.code.toUpperCase(), discount_value: Number(form.discount_value), min_order: Number(form.min_order) });
    if (error) return toast.error(error.message);
    toast.success("Cupom criado");
    setForm({ code: "", description: "", discount_type: "percent", discount_value: 10, min_order: 0, is_active: true });
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }
  async function del(id: string) {
    await supabase.from("coupons").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Cupons</h1>
      <div className="rounded-2xl bg-card border border-border p-4 grid sm:grid-cols-3 gap-2">
        <input placeholder="Código" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:outline-none" />
        <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="h-11 px-4 rounded-xl bg-muted">
          <option value="percent">Percentual %</option><option value="fixed">Valor fixo R$</option>
        </select>
        <input type="number" placeholder="Valor desconto" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: +e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:outline-none" />
        <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:outline-none sm:col-span-2" />
        <input type="number" placeholder="Pedido mínimo R$" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: +e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:outline-none" />
        <button onClick={add} className="sm:col-span-3 h-11 rounded-full bg-gradient-pill text-primary-foreground font-semibold inline-flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Criar cupom</button>
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>
            <th className="p-3">Código</th><th className="p-3">Descrição</th><th className="p-3">Desconto</th><th className="p-3">Mínimo</th><th className="p-3">Usos</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {data?.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-mono font-bold">{c.code}</td>
                <td className="p-3 text-muted-foreground">{c.description}</td>
                <td className="p-3">{c.discount_type === "percent" ? `${c.discount_value}%` : `R$${c.discount_value}`}</td>
                <td className="p-3">R$ {c.min_order}</td>
                <td className="p-3">{c.uses_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                <td className="p-3 text-right"><button onClick={() => del(c.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
