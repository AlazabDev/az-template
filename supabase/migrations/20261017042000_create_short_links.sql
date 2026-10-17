-- Public short links managed by administrators.
CREATE TABLE IF NOT EXISTS public.short_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  clicks BIGINT NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  last_clicked_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT short_links_slug_format CHECK (char_length(slug) BETWEEN 2 AND 64 AND slug !~ '[/?#[:space:]]'),
  CONSTRAINT short_links_target_url_format CHECK (target_url ~* '^https?://')
);

CREATE INDEX IF NOT EXISTS short_links_active_slug_idx
  ON public.short_links (slug) WHERE is_active = true;

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view short links" ON public.short_links;
CREATE POLICY "Admins can view short links"
  ON public.short_links FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can create short links" ON public.short_links;
CREATE POLICY "Admins can create short links"
  ON public.short_links FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update short links" ON public.short_links;
CREATE POLICY "Admins can update short links"
  ON public.short_links FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete short links" ON public.short_links;
CREATE POLICY "Admins can delete short links"
  ON public.short_links FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS short_links_updated_at ON public.short_links;
CREATE TRIGGER short_links_updated_at
  BEFORE UPDATE ON public.short_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Resolve and count in one atomic, security-definer operation. No public table read policy is needed.
CREATE OR REPLACE FUNCTION public.resolve_short_link(p_slug TEXT)
RETURNS TABLE(target_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.short_links
  SET clicks = clicks + 1,
      last_clicked_at = now()
  WHERE slug = p_slug AND is_active = true
  RETURNING short_links.target_url;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_short_link(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_short_link(TEXT) TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.short_links TO authenticated;
