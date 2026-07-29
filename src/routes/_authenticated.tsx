import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { User, Package, Heart, MapPin, Bell, Star, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/login", search: { redirect: "/conta" } as any }); }, [loading, user, navigate]);
  if (loading || !user) return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;

  const menu = [
    { to: "/conta" as const, icon: User, label: "Meu perfil" },
    { to: "/conta/pedidos" as const, icon: Package, label: "Meus pedidos" },
    { to: "/conta/favoritos" as const, icon: Heart, label: "Favoritos" },
    { to: "/conta/enderecos" as const, icon: MapPin, label: "Endereços" },
    { to: "/conta/fidelidade" as const, icon: Star, label: "Pontos & Cashback" },
    { to: "/conta/notificacoes" as const, icon: Bell, label: "Notificações" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-3xl bg-card border border-border p-4 h-fit">
          <div className="px-3 py-3">
            <div className="text-sm text-muted-foreground">Olá,</div>
            <div className="font-semibold truncate">{user.email}</div>
          </div>
          <nav className="space-y-1">
            {menu.map((m) => (
              <Link key={m.to} to={m.to} activeProps={{ className: "bg-primary/10 text-primary" }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-muted">
                <m.icon className="w-4 h-4" /> {m.label}
              </Link>
            ))}
            <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </nav>
        </aside>
        <div><Outlet /></div>
      </main>
      <Footer />
    </div>
  );
}
