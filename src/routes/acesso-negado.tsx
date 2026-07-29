import { createFileRoute } from "@tanstack/react-router";
import { ErrorState } from "@/components/ErrorState";

export const Route = createFileRoute("/acesso-negado")({
  component: () => (
    <ErrorState code="403" emoji="🔒" tone="warning"
      title="Acesso negado"
      description="Você não tem permissão para acessar esta área. Se acredita ser um engano, entre em contato com o suporte." />
  ),
  head: () => ({ meta: [{ title: "Acesso negado — Bambolê Prudente" }, { name: "robots", content: "noindex" }] }),
});
