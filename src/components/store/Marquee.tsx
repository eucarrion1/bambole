const items = [
  "✨ Novidades toda semana",
  "🚚 Entrega expressa 24h",
  "💳 Até 12x sem juros",
  "🎁 Cashback de 5%",
  "🔒 Compra 100% segura",
  "💖 Trocas facilitadas",
];

export function Marquee() {
  const loop = [...items, ...items];
  return (
    <div className="bg-foreground text-background overflow-hidden">
      <div className="flex gap-12 py-3 whitespace-nowrap animate-marquee font-semibold text-sm">
        {loop.map((t, i) => (
          <span key={i} className="flex items-center gap-3">
            <span>{t}</span>
            <span className="text-primary">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
