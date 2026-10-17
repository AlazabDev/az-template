import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import NotFound from './NotFound';
import { supabase } from '@/integrations/supabase/client';

const ShortLinkRedirectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!slug) {
        setMissing(true);
        return;
      }

      const { data, error } = await supabase.rpc('resolve_short_link', { p_slug: slug });
      const destination = data?.[0]?.target_url;

      if (cancelled) return;
      if (error || !destination) {
        setMissing(true);
        return;
      }

      window.location.replace(destination);
    };

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (missing) return <NotFound />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-construction-primary" />
        <p>جارٍ تحويلك إلى الرابط...</p>
      </div>
    </main>
  );
};

export default ShortLinkRedirectPage;
