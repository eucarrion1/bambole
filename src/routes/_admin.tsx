import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingCart, Users, Ticket, Settings, Tag, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: location.href || "/admin" } as any });
    else if (!loading && user && !isAdmin) navigate({ to: "/acesso-negado" });
  }, [loading, user, isAdmin, navigate, location.href]);

  if (loading || !user || !isAdmin) return <div className="min-h-screen grid place-items-center text-muted-foreground">Validando acesso…</div>;

  const menu = [
    { to: "/admin" as const, icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/produtos" as const, icon: Package, label: "Produtos" },
    { to: "/admin/categorias" as const, icon: Tag, label: "Categorias" },
    { to: "/admin/pedidos" as const, icon: ShoppingCart, label: "Pedidos" },
    { to: "/admin/clientes" as const, icon: Users, label: "Clientes" },
    { to: "/admin/cupons" as const, icon: Ticket, label: "Cupons" },
    { to: "/admin/configuracoes" as const, icon: Settings, label: "Configurações" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-card border-r border-border p-4 lg:h-screen lg:sticky lg:top-0">
        <Link to="/" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="w-3 h-3" /> Voltar à loja</Link>
        <h2 className="mt-3 font-display font-bold text-lg">Admin Bambolê</h2>
        <nav className="mt-4 space-y-1">
          {menu.map((m) => (
            <Link key={m.to} to={m.to} activeOptions={{ exact: m.to === "/admin" }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted">
              <m.icon className="w-4 h-4" /> {m.label}
            </Link>
          ))}
          <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10">Sair</button>
        </nav>
      </aside>
      <main className="p-6"><Outlet /></main>
    </div>
  );
}
