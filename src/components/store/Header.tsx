import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Heart, User, ShoppingBag, Menu, LogOut, LayoutDashboard, Package } from "lucide-react";
import defaultLogo from "@/assets/logo-bambole.png";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useStoreSettings } from "@/lib/store-settings";
import { useState } from "react";

const nav = [
  { label: "Loja", href: "/loja" as const },
  { label: "Novidades", href: "/loja?tag=novo" as const },
  { label: "Ofertas", href: "/loja?promo=1" as const },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const { data: settings } = useStoreSettings();
  const logo = settings?.logo_url || defaultLogo;
  const storeName = settings?.store_name || "Bambolê";
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="bg-gradient-pill text-primary-foreground text-xs font-semibold">
        <div className="mx-auto max-w-7xl px-4 h-9 flex items-center justify-center gap-2 text-center">
          <span className="hidden sm:inline">✨ Frete grátis acima de R$ 199</span>
          <span className="hidden sm:inline opacity-60">•</span>
          <span>Use o cupom BEMVINDO10 e ganhe 10% off na 1ª compra</span>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 h-20 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt={storeName} className="h-12 w-12 rounded-full object-cover" />
          <div className="hidden sm:block leading-tight">
            <div className="font-display text-lg font-bold">{storeName}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Prudente</div>
          </div>
        </Link>

        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/loja", search: { q: search } as any }); }}
          className="hidden md:flex flex-1 max-w-xl"
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos, marcas, categorias…"
              className="w-full h-11 pl-11 pr-4 rounded-full bg-muted border border-transparent focus:bg-background focus:border-ring focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all text-sm"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <div className="relative group">
            <button aria-label="Conta" className="h-11 w-11 rounded-full hover:bg-muted grid place-items-center transition-colors">
              <User className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-pop p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {user ? (
                <>
                  <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
                  <Link to="/conta" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"><User className="w-4 h-4" /> Minha conta</Link>
                  <Link to="/conta/pedidos" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"><Package className="w-4 h-4" /> Meus pedidos</Link>
                  <Link to="/conta/favoritos" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"><Heart className="w-4 h-4" /> Favoritos</Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm font-semibold text-primary"><LayoutDashboard className="w-4 h-4" /> Admin</Link>
                  )}
                  <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-destructive"><LogOut className="w-4 h-4" /> Sair</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm font-semibold">Entrar</Link>
                  <Link to="/login" search={{ tab: "signup" } as any} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm">Criar conta</Link>
                </>
              )}
            </div>
          </div>
          <Link to="/conta/favoritos" aria-label="Favoritos" className="h-11 w-11 rounded-full hover:bg-muted grid place-items-center transition-colors">
            <Heart className="w-5 h-5" />
          </Link>
          <Link to="/carrinho" aria-label="Carrinho" className="relative h-11 w-11 rounded-full bg-gradient-pill text-primary-foreground grid place-items-center shadow-pop hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold grid place-items-center border-2 border-background">{count}</span>
            )}
          </Link>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" className="md:hidden h-11 w-11 rounded-full hover:bg-muted grid place-items-center">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      <nav className={`${menuOpen ? "block" : "hidden"} md:block border-t border-border`}>
        <ul className="mx-auto max-w-7xl px-4 md:h-11 flex flex-col md:flex-row md:items-center gap-1 py-2 md:py-0 text-sm font-medium">
          {nav.map((n) => (
            <li key={n.label}>
              <Link to={n.href} className="block px-3 py-1.5 rounded-full hover:bg-muted transition-colors">{n.label}</Link>
            </li>
          ))}
          <li className="md:ml-auto">
            <Link to="/loja" search={{ promo: 1 } as any} className="block px-3 py-1.5 rounded-full text-primary font-bold hover:bg-primary/10">🔥 Ofertas relâmpago</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
