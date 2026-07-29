import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/ErrorState";

export const Route = createFileRoute("/sessao-expirada")({
  component: () => (
    <ErrorState emoji="⏰" tone="info"
      title="Sua sessão expirou"
      description="Por segurança, encerramos sua sessão. Faça login novamente para continuar."
      primaryHref="/login" primaryLabel="Fazer login"
      secondary={<Link to="/" className="h-11 px-5 rounded-xl border border-border font-semibold grid place-items-center">Ir para a loja</Link>} />
  ),
  head: () => ({ meta: [{ title: "Sessão expirada — Bambolê Prudente" }, { name: "robots", content: "noindex" }] }),
});
