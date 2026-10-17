import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Link2, Loader2, MousePointerClick, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ShortLinkSummary {
  id: string;
  slug: string;
  target_url: string;
  title: string | null;
  is_active: boolean;
  clicks: number;
}

const SITE_ORIGIN = 'https://alazab.com';

export const AdminShortLinksOverview: React.FC = () => {
  const [links, setLinks] = useState<ShortLinkSummary[]>([]);
  const [totalLinkCount, setTotalLinkCount] = useState(0);
  const [activeLinkCount, setActiveLinkCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    const [{ data }, { count }, { count: activeCount }] = await Promise.all([
      supabase
        .from('short_links')
        .select('id, slug, target_url, title, is_active, clicks')
        .order('clicks', { ascending: false })
        .limit(5),
      supabase.from('short_links').select('id', { count: 'exact', head: true }),
      supabase.from('short_links').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    setLinks((data || []) as ShortLinkSummary[]);
    setTotalLinkCount(count || 0);
    setActiveLinkCount(activeCount || 0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  const totalClicks = useMemo(() => links.reduce((total, link) => total + link.clicks, 0), [links]);

  return (
    <section className="azab-card" aria-labelledby="short-links-overview-title">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 id="short-links-overview-title" className="flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--azab-primary)' }}>
            <Link2 className="h-5 w-5" />
            اختصار الروابط
          </h3>
          <p className="mt-2 text-sm text-gray-600">ملخص سريع لأكثر الروابط المختصرة استخدامًا.</p>
        </div>
        <Link to="/link-shortener" className="text-sm font-medium hover:underline" style={{ color: 'var(--azab-primary)' }}>
          إدارة الروابط
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-32 items-center justify-center" aria-label="جارٍ تحميل إحصائيات الروابط">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--azab-primary)' }} />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-blue-700"><Link2 className="h-4 w-4" /> إجمالي الروابط</div>
              <strong className="text-2xl text-blue-900">{totalLinkCount}</strong>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-emerald-700"><TrendingUp className="h-4 w-4" /> روابط نشطة</div>
              <strong className="text-2xl text-emerald-900">{activeLinkCount}</strong>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-amber-700"><MousePointerClick className="h-4 w-4" /> نقرات الأعلى استخدامًا</div>
              <strong className="text-2xl text-amber-900">{totalClicks.toLocaleString('ar-EG')}</strong>
            </div>
          </div>

          {links.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
              لا توجد روابط مختصرة بعد. <Link to="/link-shortener" className="font-medium underline">أنشئ أول رابط</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={link.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-construction-primary text-sm font-bold text-white">{index + 1}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        <span>{link.title || link.slug}</span>
                        {!link.is_active && <span className="text-xs font-normal text-gray-500">(متوقف)</span>}
                      </div>
                      <a href={`${SITE_ORIGIN}/${encodeURIComponent(link.slug)}`} target="_blank" rel="noreferrer" className="flex max-w-full items-center gap-1 truncate text-sm text-blue-600 hover:underline" dir="ltr">
                        {SITE_ORIGIN}/{link.slug}<ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MousePointerClick className="h-4 w-4 text-construction-accent" />
                    {link.clicks.toLocaleString('ar-EG')} نقرة
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};
