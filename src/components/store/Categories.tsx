import { Link } from "@tanstack/react-router";
import { useCategories } from "@/lib/catalog";

export function Categories() {
  const { data: cats, isLoading } = useCategories();

  return (
    <section id="categorias" className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Categorias</p>
          <h2 className="text-3xl md:text-4xl font-bold mt-1">Explore por categoria</h2>
        </div>
        <Link to="/loja" className="hidden sm:inline text-sm font-semibold text-primary hover:underline">
          Ver tudo →
        </Link>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-muted h-36 md:h-44 animate-pulse" />
            ))
          : cats?.map((c) => (
              <Link
                key={c.id}
                to="/loja"
                search={{ cat: c.slug } as any}
                className="group rounded-3xl bg-card border border-border p-4 md:p-6 shadow-card hover:-translate-y-1 transition-transform block"
              >
                <div
                  className={`mx-auto w-14 h-14 md:w-20 md:h-20 rounded-full grid place-items-center text-3xl md:text-4xl group-hover:scale-110 transition-transform ${c.color ?? "bg-muted"}`}
                >
                  {c.emoji ?? "🛍️"}
                </div>
                <div className="mt-3 text-sm md:text-base font-semibold text-center">{c.name}</div>
              </Link>
            ))}
      </div>
    </section>
  );
}
