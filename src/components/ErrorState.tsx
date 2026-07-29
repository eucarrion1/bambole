import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface Props {
  code?: string | number;
  emoji?: string;
  title: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondary?: ReactNode;
  tone?: "default" | "danger" | "warning" | "info";
}

const toneMap = {
  default: "from-brand-magenta to-brand-pink",
  danger: "from-destructive to-brand-pink",
  warning: "from-brand-yellow to-brand-pink",
  info: "from-brand-cyan to-brand-blue",
} as const;

export function ErrorState({ code, emoji = "✨", title, description, primaryHref = "/", primaryLabel = "Voltar à loja", secondary, tone = "default" }: Props) {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${toneMap[tone]} grid place-items-center text-5xl shadow-pop`}>{emoji}</div>
        {code !== undefined && <div className="mt-6 font-display text-6xl font-bold text-foreground">{code}</div>}
        <h1 className="mt-3 font-display text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link to={primaryHref} className="h-11 px-5 rounded-xl bg-gradient-pill text-primary-foreground font-semibold shadow-pop grid place-items-center">
            {primaryLabel}
          </Link>
          {secondary}
        </div>
      </div>
    </div>
  );
}
