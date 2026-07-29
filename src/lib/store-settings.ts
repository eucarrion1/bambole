import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StoreSettings = {
  id: string;
  store_name: string | null;
  store_email: string | null;
  store_phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  free_shipping_threshold: number | null;
  loyalty_rate: number | null;
  promo_title: string | null;
  promo_subtitle: string | null;
  promo_badge: string | null;
  promo_cta_label: string | null;
  promo_cta_link: string | null;
  promo_ends_at: string | null;
  promo_active: boolean | null;
  hero_badge: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  secondary_color: string | null;
};

export function useStoreSettings() {
  return useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("store_settings").select("*").maybeSingle();
      return data as StoreSettings | null;
    },
    staleTime: 60_000,
  });
}
