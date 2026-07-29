import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email, source: "home" });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.info("Esse e-mail já está cadastrado.");
      else toast.error("Não foi possível cadastrar agora.");
      return;
    }
    toast.success("Pronto! Use o cupom BEMVINDO10 na primeira compra.");
    setEmail("");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="rounded-[2rem] border-2 border-dashed border-primary/40 bg-card p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-brand-yellow/40 blur-3xl" />
        <div className="relative">
          <div className="text-4xl">💌</div>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold">Receba mimos exclusivos</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Cadastre seu e-mail e ganhe <strong className="text-primary">10% off</strong> na primeira compra + ofertas semanais.
          </p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 h-12 px-5 rounded-full bg-muted border border-transparent focus:bg-background focus:border-ring focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
            <button disabled={loading} className="h-12 px-6 rounded-full bg-gradient-pill text-primary-foreground font-semibold shadow-pop hover:scale-[1.03] transition-transform disabled:opacity-60">
              {loading ? "Enviando…" : "Quero meu cupom"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
