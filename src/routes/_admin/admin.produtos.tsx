import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";
import { resolveProductImage } from "@/lib/product-image";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/produtos")({
  component: AdminProdutos,
});

function AdminProdutos() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*").order("position")).data ?? [],
  });
  const { data: categories } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*")).data ?? [],
  });

  function blank() {
    setEditing({ name: "", slug: "", price: 0, sale_price: null, stock: 0, image_url: "clothes", short_description: "", category_id: categories?.[0]?.id, is_active: true, is_featured: false, tag: "" });
  }

  async function save() {
    const payload = { ...editing, price: Number(editing.price), sale_price: editing.sale_price ? Number(editing.sale_price) : null, stock: Number(editing.stock) };
    if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Produto salvo");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function remove(id: string) {
    if (!confirm("Excluir este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-3xl font-bold">Produtos</h1>
        <button onClick={blank} className="px-4 h-10 rounded-full bg-gradient-pill text-primary-foreground font-semibold text-sm inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Novo produto</button>
      </div>

      {editing && (
        <div className="rounded-2xl bg-card border border-border p-4 grid sm:grid-cols-2 gap-2">
          <input placeholder="Nome" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 sm:col-span-2" />
          <input placeholder="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:bg-background focus:outline-none" />
          <select value={editing.category_id || ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:outline-none">
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" step="0.01" placeholder="Preço" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:outline-none" />
          <input type="number" step="0.01" placeholder="Preço promocional" value={editing.sale_price || ""} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:outline-none" />
          <input type="number" placeholder="Estoque" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:outline-none" />
          <select value={editing.image_url || "clothes"} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="h-11 px-4 rounded-xl bg-muted">
            <option value="clothes">Roupa</option><option value="toy">Brinquedo</option><option value="bottle">Mamadeira</option><option value="stroller">Carrinho</option>
          </select>
          <input placeholder="Tag (ex: novo)" value={editing.tag || ""} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} className="h-11 px-4 rounded-xl bg-muted focus:outline-none" />
          <textarea placeholder="Descrição curta" value={editing.short_description || ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} className="p-3 rounded-xl bg-muted focus:outline-none sm:col-span-2" rows={2} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Ativo</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Destaque</label>
          <div className="sm:col-span-2 flex gap-2">
            <button onClick={save} className="px-6 h-11 rounded-full bg-gradient-pill text-primary-foreground font-semibold">Salvar</button>
            <button onClick={() => setEditing(null)} className="px-6 h-11 rounded-full bg-muted font-semibold">Cancelar</button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>
            <th className="p-3">Produto</th><th className="p-3">Preço</th><th className="p-3">Estoque</th><th className="p-3">Status</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 flex items-center gap-3"><img src={resolveProductImage(p.image_url)} className="w-10 h-10 rounded-lg object-cover" alt="" /><div><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">{p.slug}</div></div></td>
                <td className="p-3">{formatBRL(Number(p.sale_price ?? p.price))}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.is_active ? <span className="text-success text-xs">Ativo</span> : <span className="text-muted-foreground text-xs">Inativo</span>}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive grid place-items-center"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
