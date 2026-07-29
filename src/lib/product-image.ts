import clothes from "@/assets/prod-clothes.jpg";
import toy from "@/assets/prod-toy.jpg";
import bottle from "@/assets/prod-bottle.jpg";
import stroller from "@/assets/prod-stroller.jpg";

const map: Record<string, string> = { clothes, toy, bottle, stroller };

export function resolveProductImage(key: string | null | undefined) {
  if (!key) return clothes;
  return map[key] ?? clothes;
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
