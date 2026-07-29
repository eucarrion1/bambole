ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS promo_title TEXT DEFAULT 'Até 60% off em brinquedos',
  ADD COLUMN IF NOT EXISTS promo_subtitle TEXT DEFAULT 'Corre que acaba! Os preços mais doces da temporada estão por tempo limitadíssimo.',
  ADD COLUMN IF NOT EXISTS promo_badge TEXT DEFAULT '🔥 Oferta relâmpago',
  ADD COLUMN IF NOT EXISTS promo_cta_label TEXT DEFAULT 'Aproveitar →',
  ADD COLUMN IF NOT EXISTS promo_cta_link TEXT DEFAULT '/loja?promo=1',
  ADD COLUMN IF NOT EXISTS promo_ends_at TIMESTAMPTZ DEFAULT (now() + interval '8 hours'),
  ADD COLUMN IF NOT EXISTS promo_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS hero_badge TEXT DEFAULT 'Coleção Primavera 2026',
  ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'Tudo pro seu pequeno com muito carinho.',
  ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Roupinhas, brinquedos e enxoval com curadoria das melhores marcas — entrega rápida em todo Brasil e parcelamento em até 12x.';