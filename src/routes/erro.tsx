import { createFileRoute } from "@tanstack/react-router";
import { ErrorState } from "@/components/ErrorState";

export const Route = createFileRoute("/erro")({
  component: () => (
    <ErrorState code="500" emoji="🛠️" tone="danger"
      title="Tivemos um problema interno"
      description="Nossa equipe já foi notificada. Tente novamente em instantes." />
  ),
  head: () => ({ meta: [{ title: "Erro interno — Bambolê Prudente" }, { name: "robots", content: "noindex" }] }),
});
