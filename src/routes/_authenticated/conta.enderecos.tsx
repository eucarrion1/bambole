import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta/enderecos")({
  component: EnderecosPage,
});

function EnderecosPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ label: "Casa", recipient: "", zip: "", street: "", number: "", complement: "", district: "", city: "", state: "" });
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => (await supabase.from("addresses").select("*").eq("user_id", user!.id).order("is_default", { ascending: false })).data ?? [],
    enabled: !!user,
  });

  async function add() {
    const { error } = await supabase.from("addresses").insert({ ...form, user_id: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Endereço adicionado");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["addresses"] });
  }
  async function del(id: string) {
    await supabase.from("addresses").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["addresses"] });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-display text-2xl font-bold">Endereços</h1>
        <button onClick={() => setOpen((v) => !v)} className="px-4 h-10 rounded-full bg-gradient-pill text-primary-foreground font-semibold text-sm inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Novo</button>
      </div>

      {open && (
        <div className="rounded-2xl bg-card border border-border p-4 mb-4 grid sm:grid-cols-2 gap-2">
          {[["label", "Apelido"], ["recipient", "Destinatário"], ["zip", "CEP"], ["street", "Rua"], ["number", "Número"], ["complement", "Complemento"], ["district", "Bairro"], ["city", "Cidade"], ["state", "UF"]].map(([k, l]) => (
            <input key={k} placeholder={l} value={(form as any)[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="h-11 px-4 rounded-xl bg-muted focus:bg-background border border-transparent focus:border-ring focus:outline-none text-sm" />
          ))}
          <button onClick={add} className="sm:col-span-2 h-11 rounded-full bg-foreground text-background font-semibold">Salvar endereço</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {data?.map((a) => (
          <div key={a.id} className="rounded-2xl bg-card border border-border p-4">
            <div className="flex justify-between"><div className="font-semibold inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {a.label}</div>
              <button onClick={() => del(a.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button></div>
            <div className="text-sm text-muted-foreground mt-1">{a.recipient}<br />{a.street}, {a.number} {a.complement}<br />{a.district} — {a.city}/{a.state}<br />CEP {a.zip}</div>
          </div>
        ))}
        {data?.length === 0 && <div className="text-muted-foreground">Nenhum endereço cadastrado.</div>}
      </div>
    </div>
  );
}
