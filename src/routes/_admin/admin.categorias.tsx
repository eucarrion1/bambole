import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/categorias")({
  component: AdminCategorias,
});

function AdminCategorias() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", slug: "", emoji: "✨" });
  const { data } = useQuery({
    queryKey: ["admin-cats-list"],
    queryFn: async () => (await supabase.from("categories").select("*").order("position")).data ?? [],
  });
  async function add() {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    const { error } = await supabase.from("categories").insert({ ...form, slug });
    if (error) return toast.error(error.message);
    setForm({ name: "", slug: "", emoji: "✨" });
    qc.invalidateQueries({ queryKey: ["admin-cats-list"] });
    toast.success("Categoria criada");
  }
  async function del(id: string) {
    await supabase.from("categories").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-cats-list"] });
  }
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Categorias</h1>
      <div className="rounded-2xl bg-card border border-border p-4 flex flex-wrap gap-2">
        <input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="h-11 w-20 px-4 rounded-xl bg-muted focus:outline-none" />
        <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 flex-1 px-4 rounded-xl bg-muted focus:outline-none" />
        <input placeholder="Slug (opcional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-11 flex-1 px-4 rounded-xl bg-muted focus:outline-none" />
        <button onClick={add} className="px-5 h-11 rounded-full bg-gradient-pill text-primary-foreground font-semibold inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar</button>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {data?.map((c) => (
          <div key={c.id} className="rounded-2xl bg-card border border-border p-4 flex justify-between items-center">
            <div><div className="text-3xl">{c.emoji}</div><div className="font-semibold">{c.name}</div><div className="text-xs text-muted-foreground">/{c.slug}</div></div>
            <button onClick={() => del(c.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
