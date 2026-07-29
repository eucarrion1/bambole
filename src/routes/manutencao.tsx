import { createFileRoute } from "@tanstack/react-router";
import { ErrorState } from "@/components/ErrorState";

export const Route = createFileRoute("/manutencao")({
  component: () => (
    <ErrorState emoji="🧰" tone="warning"
      title="Estamos em manutenção"
      description="Voltamos em instantes com novidades. Obrigado pela paciência 💖"
      primaryLabel="Tentar novamente"
      primaryHref="/" />
  ),
  head: () => ({ meta: [{ title: "Em manutenção — Bambolê Prudente" }, { name: "robots", content: "noindex" }] }),
});
