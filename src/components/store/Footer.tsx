import { Instagram, MessageCircle, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo-bambole.png";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-8">
      <div className="mx-auto max-w-7xl px-4 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Bambolê" className="h-12 w-12 rounded-full" />
            <div>
              <div className="font-display font-bold text-lg">Bambolê</div>
              <div className="text-[11px] uppercase tracking-widest text-background/60">Prudente</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-background/70">
            Loja virtual com tudo pro seu pequeno. Atendimento via direct e WhatsApp.
          </p>
          <div className="mt-5 flex gap-2">
            <a href="https://instagram.com/bambolepudente" aria-label="Instagram" className="h-10 w-10 rounded-full bg-background/10 hover:bg-primary grid place-items-center transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="WhatsApp" className="h-10 w-10 rounded-full bg-background/10 hover:bg-primary grid place-items-center transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" aria-label="E-mail" className="h-10 w-10 rounded-full bg-background/10 hover:bg-primary grid place-items-center transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {[
          { title: "Loja", links: ["Novidades", "Mais vendidos", "Ofertas", "Marcas"] },
          { title: "Ajuda", links: ["Trocas e devoluções", "Frete e prazo", "Formas de pagamento", "Fale conosco"] },
          { title: "Conta", links: ["Meu perfil", "Meus pedidos", "Favoritos", "Cashback"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-display font-bold mb-3">{col.title}</h4>
            <ul className="space-y-2 text-sm text-background/70">
              {col.links.map((l) => (
                <li key={l}><a href="#" className="hover:text-background transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-background/60">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Presidente Prudente, SP
          </div>
          <div>© {new Date().getFullYear()} Bambolê Prudente. Todos os direitos reservados.</div>
        </div>
      </div>
    </footer>
  );
}
