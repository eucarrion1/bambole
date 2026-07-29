import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/store/Header";
import { Hero } from "@/components/store/Hero";
import { Marquee } from "@/components/store/Marquee";
import { Categories } from "@/components/store/Categories";
import { Products } from "@/components/store/Products";
import { Countdown } from "@/components/store/Countdown";
import { Testimonials } from "@/components/store/Testimonials";
import { Newsletter } from "@/components/store/Newsletter";
import { Footer } from "@/components/store/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Bambolê Prudente — Loja virtual para bebês e crianças" },
      { name: "description", content: "Roupinhas, brinquedos e enxoval com curadoria. Cashback, frete grátis acima de R$199 e parcelamento em até 12x." },
      { property: "og:title", content: "Bambolê Prudente — Loja virtual" },
      { property: "og:description", content: "Tudo pro seu pequeno com muito carinho. Compre online com entrega rápida." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Categories />
        <Products />
        <Countdown />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
