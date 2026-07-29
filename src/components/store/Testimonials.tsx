import { Star } from "lucide-react";

const items = [
  { name: "Mariana S.", text: "Atendimento impecável e entrega super rápida! As roupinhas são lindas demais.", role: "Mãe da Laura, 8 meses" },
  { name: "Camila R.", text: "Loja de confiança em Prudente! Já comprei várias vezes e nunca decepcionou.", role: "Mãe do Theo, 2 anos" },
  { name: "Bruna L.", text: "Embalagem caprichada, parece presente. Meu filho amou o ursinho!", role: "Mãe do Davi, 1 ano" },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Mamães amam</p>
        <h2 className="text-3xl md:text-4xl font-bold mt-1">+10 mil famílias felizes</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((t) => (
          <figure key={t.name} className="rounded-3xl bg-card border border-border p-6 shadow-card">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
              ))}
            </div>
            <blockquote className="mt-4 text-foreground">"{t.text}"</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-pill grid place-items-center text-primary-foreground font-bold">
                {t.name[0]}
              </div>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
