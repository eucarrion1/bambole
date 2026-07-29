import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import logo from "@/assets/logo-bambole.png";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as string) === "signup" ? "signup" : "login",
    redirect: (s.redirect as string) || "/conta",
  }),
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — Bambolê Prudente" }] }),
});

function LoginPage() {
  const { tab, redirect } = Route.useSearch();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(tab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: isAdmin ? "/admin" : redirect });
    }
  }, [authLoading, user, isAdmin, navigate, redirect]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/conta`, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode comprar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao autenticar");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block bg-gradient-to-br from-brand-magenta via-brand-pink to-brand-yellow relative overflow-hidden">
        <div className="absolute inset-0 grid place-items-center text-primary-foreground p-12">
          <div className="max-w-sm">
            <img src={logo} className="h-16 w-16 rounded-full bg-white p-1" alt="" />
            <h1 className="mt-6 font-display text-4xl font-bold">Tudo pro seu pequeno em um só lugar 💖</h1>
            <p className="mt-4 opacity-90">Cashback, frete grátis acima de R$199 e clube de fidelidade exclusivo.</p>
          </div>
        </div>
      </div>
      <div className="grid place-items-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar à loja</Link>
          <h2 className="mt-4 font-display text-3xl font-bold">{mode === "login" ? "Entre na sua conta" : "Crie sua conta"}</h2>
          <div className="mt-1 inline-flex bg-muted rounded-full p-1 text-sm">
            <button onClick={() => setMode("login")} className={`px-4 py-1.5 rounded-full ${mode === "login" ? "bg-background shadow-sm font-semibold" : ""}`}>Entrar</button>
            <button onClick={() => setMode("signup")} className={`px-4 py-1.5 rounded-full ${mode === "signup" ? "bg-background shadow-sm font-semibold" : ""}`}>Cadastrar</button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo"
                className="w-full h-12 px-4 rounded-xl bg-muted focus:bg-background border border-transparent focus:border-ring focus:outline-none" />
            )}
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail"
              className="w-full h-12 px-4 rounded-xl bg-muted focus:bg-background border border-transparent focus:border-ring focus:outline-none" />
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mín. 6 caracteres)"
              className="w-full h-12 px-4 rounded-xl bg-muted focus:bg-background border border-transparent focus:border-ring focus:outline-none" />
            <button disabled={loading} className="w-full h-12 rounded-xl bg-gradient-pill text-primary-foreground font-semibold shadow-pop hover:scale-[1.01] transition-transform disabled:opacity-60">
              {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Ao continuar, você aceita nossos termos e política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
