import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/configuracoes")({
  component: AdminConfig,
});

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminConfig() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => (await supabase.from("store_settings").select("*").maybeSingle()).data,
  });
  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  async function save() {
    const payload = { ...form };
    if (payload.promo_ends_at && !payload.promo_ends_at.includes("Z")) {
      // local datetime-input -> ISO
      const d = new Date(payload.promo_ends_at);
      if (!Number.isNaN(d.getTime())) payload.promo_ends_at = d.toISOString();
    }
    const { error } = await supabase.from("store_settings").update(payload).eq("id", form.id);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
    qc.invalidateQueries({ queryKey: ["store-settings"] });
  }

  if (!data) return <div className="text-muted-foreground">Carregando…</div>;

  const Field = ({ k, l, type = "text", step }: { k: string; l: string; type?: string; step?: string }) => (
    <label className="text-sm">
      <div className="text-muted-foreground mb-1">{l}</div>
      <input
        type={type}
        step={step}
        value={form[k] ?? ""}
        onChange={(e) => setForm({ ...form, [k]: type === "number" ? (e.target.value === "" ? null : +e.target.value) : e.target.value })}
        className="w-full h-11 px-4 rounded-xl bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );

  const Area = ({ k, l }: { k: string; l: string }) => (
    <label className="text-sm sm:col-span-2">
      <div className="text-muted-foreground mb-1">{l}</div>
      <textarea
        value={form[k] ?? ""}
        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        rows={2}
        className="w-full px-4 py-3 rounded-xl bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );

  return (
    <div className="space-y-6 max-w-3xl pb-12">
      <h1 className="font-display text-3xl font-bold">Configurações da loja</h1>

      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-semibold mb-3">Dados da loja</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field k="store_name" l="Nome da loja" />
          <Field k="store_email" l="E-mail" />
          <Field k="store_phone" l="Telefone" />
          <Field k="whatsapp" l="WhatsApp" />
          <Field k="instagram" l="Instagram" />
          <Field k="free_shipping_threshold" l="Frete grátis a partir de (R$)" type="number" />
          <Field k="loyalty_rate" l="Cashback (ex: 0.05 = 5%)" type="number" step="0.01" />
        </div>
      </section>

      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-semibold mb-1">Destaque do topo (Hero)</h2>
        <p className="text-xs text-muted-foreground mb-3">Edita o bloco principal da home.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field k="hero_badge" l="Selo/badge" />
          <Field k="hero_title" l="Título principal" />
          <Area k="hero_subtitle" l="Subtítulo" />
        </div>
      </section>

      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-semibold mb-1">Identidade visual</h2>
        <p className="text-xs text-muted-foreground mb-3">Logo da loja e cores principais. As cores se aplicam em toda a plataforma.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm sm:col-span-2">
            <div className="text-muted-foreground mb-1">Logo</div>
            <div className="flex items-center gap-3">
              {form.logo_url && <img src={form.logo_url} alt="logo" className="h-14 w-14 rounded-full object-cover border border-border" />}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const ext = file.name.split(".").pop() || "png";
                  const path = `logo-${Date.now()}.${ext}`;
                  const { error: upErr } = await supabase.storage.from("branding").upload(path, file, { upsert: true, contentType: file.type });
                  if (upErr) return toast.error(upErr.message);
                  const { data: pub } = supabase.storage.from("branding").getPublicUrl(path);
                  setForm({ ...form, logo_url: pub.publicUrl });
                  toast.success("Logo enviada — clique em Salvar");
                }}
                className="text-sm"
              />
            </div>
          </label>
          <label className="text-sm">
            <div className="text-muted-foreground mb-1">Cor primária</div>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primary_color || "#e91e63"} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-11 w-14 rounded-xl bg-muted cursor-pointer" />
              <input type="text" value={form.primary_color || ""} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} placeholder="#e91e63 ou oklch(...)" className="flex-1 h-11 px-3 rounded-xl bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </label>
          <label className="text-sm">
            <div className="text-muted-foreground mb-1">Cor de destaque</div>
            <div className="flex items-center gap-2">
              <input type="color" value={form.accent_color || "#facc15"} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="h-11 w-14 rounded-xl bg-muted cursor-pointer" />
              <input type="text" value={form.accent_color || ""} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="flex-1 h-11 px-3 rounded-xl bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </label>
          <label className="text-sm">
            <div className="text-muted-foreground mb-1">Cor secundária</div>
            <div className="flex items-center gap-2">
              <input type="color" value={form.secondary_color || "#38bdf8"} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="h-11 w-14 rounded-xl bg-muted cursor-pointer" />
              <input type="text" value={form.secondary_color || ""} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="flex-1 h-11 px-3 rounded-xl bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </label>
        </div>
      </section>

      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-semibold mb-1">Promoção relâmpago (banner + timer)</h2>
        <p className="text-xs text-muted-foreground mb-3">Controla o banner "Até 60% off" e o contador regressivo da home.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm sm:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.promo_active}
              onChange={(e) => setForm({ ...form, promo_active: e.target.checked })}
            />
            Banner promocional ativo
          </label>
          <Field k="promo_badge" l="Selo (ex: 🔥 Oferta relâmpago)" />
          <Field k="promo_title" l="Título" />
          <Area k="promo_subtitle" l="Subtítulo" />
          <Field k="promo_cta_label" l="Texto do botão" />
          <Field k="promo_cta_link" l="Link do botão (ex: /loja?promo=1)" />
          <label className="text-sm sm:col-span-2">
            <div className="text-muted-foreground mb-1">Termina em (data e hora)</div>
            <input
              type="datetime-local"
              value={toLocalInput(form.promo_ends_at)}
              onChange={(e) => setForm({ ...form, promo_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full h-11 px-4 rounded-xl bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="text-xs text-muted-foreground mt-1">Quando o tempo zera, o banner é ocultado automaticamente.</div>
          </label>
        </div>
      </section>

      <button onClick={save} className="h-11 px-8 rounded-full bg-gradient-pill text-primary-foreground font-semibold">
        Salvar alterações
      </button>
    </div>
  );
}
