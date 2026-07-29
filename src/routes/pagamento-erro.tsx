import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/ErrorState";

export const Route = createFileRoute("/pagamento-erro")({
  component: () => (
    <ErrorState emoji="💳" tone="danger"
      title="Não foi possível concluir o pagamento"
      description="Verifique os dados do cartão, saldo disponível ou tente outra forma de pagamento."
      primaryHref="/checkout" primaryLabel="Tentar novamente"
      secondary={<Link to="/carrinho" className="h-11 px-5 rounded-xl border border-border font-semibold grid place-items-center">Voltar ao carrinho</Link>} />
  ),
  head: () => ({ meta: [{ title: "Falha no pagamento — Bambolê Prudente" }, { name: "robots", content: "noindex" }] }),
});
