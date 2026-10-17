import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Link2, Loader2, Plus, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

type ShortLink = {
  id: string;
  slug: string;
  target_url: string;
  title: string | null;
  is_active: boolean;
  clicks: number;
  last_clicked_at: string | null;
  created_at: string;
};

const SITE_ORIGIN = 'https://alazab.com';
const slugPattern = /^[\p{L}\p{N}_-]{2,64}$/u;
const reservedSlugs = new Set([
  'auth', 'services', 'projects', 'portfolio', 'about', 'contact', 'dashboard', 'admin-dashboard',
  'link-shortener', 'search', 'messages', 'settings', 'sitemap', 'blogs', 'knowledge', 'guidance',
  'faq', 'chatbot', 'profile', 'cost-calculator', 'furniture-gallery',
]);

const LinkShortenerPage: React.FC = () => {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [targetUrl, setTargetUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('short_links')
      .select('id, slug, target_url, title, is_active, clicks, last_clicked_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('تعذر تحميل اختصارات الروابط');
    } else {
      setLinks((data || []) as ShortLink[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  const shortUrl = useMemo(() => {
    const cleanSlug = slug.trim();
    return cleanSlug ? `${SITE_ORIGIN}/${encodeURIComponent(cleanSlug)}` : `${SITE_ORIGIN}/...`;
  }, [slug]);

  const resetForm = () => {
    setTargetUrl('');
    setSlug('');
    setTitle('');
    setIsActive(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanUrl = targetUrl.trim();
    const cleanSlug = slug.trim();

    try {
      const parsedUrl = new URL(cleanUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('protocol');
    } catch {
      toast.error('أدخل رابطًا صحيحًا يبدأ بـ https:// أو http://');
      return;
    }

    if (!slugPattern.test(cleanSlug)) {
      toast.error('الاختصار يجب أن يكون من حرفين إلى 64 حرفًا، دون مسافات أو / أو ? أو #');
      return;
    }
    if (reservedSlugs.has(cleanSlug.toLocaleLowerCase())) {
      toast.error('هذا الاسم محجوز لمسار أساسي في الموقع، اختر اختصارًا آخر');
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from('short_links').insert({
      target_url: cleanUrl,
      slug: cleanSlug,
      title: title.trim() || null,
      is_active: isActive,
    });
    setIsSaving(false);

    if (error) {
      toast.error(error.code === '23505' ? 'هذا الاختصار مستخدم بالفعل' : 'تعذر إنشاء الاختصار');
      return;
    }

    toast.success(`تم إنشاء الرابط ${SITE_ORIGIN}/${cleanSlug}`);
    resetForm();
    await loadLinks();
  };

  const toggleLink = async (link: ShortLink) => {
    const { error } = await supabase.from('short_links').update({ is_active: !link.is_active }).eq('id', link.id);
    if (error) {
      toast.error('تعذر تغيير حالة الرابط');
      return;
    }
    setLinks((current) => current.map((item) => item.id === link.id ? { ...item, is_active: !item.is_active } : item));
  };

  const deleteLink = async (link: ShortLink) => {
    if (!window.confirm(`حذف الاختصار ${link.slug}؟`)) return;
    const { error } = await supabase.from('short_links').delete().eq('id', link.id);
    if (error) {
      toast.error('تعذر حذف الاختصار');
      return;
    }
    setLinks((current) => current.filter((item) => item.id !== link.id));
    toast.success('تم حذف الاختصار');
  };

  const copyLink = async (linkSlug: string) => {
    await navigator.clipboard.writeText(`${SITE_ORIGIN}/${encodeURIComponent(linkSlug)}`);
    toast.success('تم نسخ الرابط المختصر');
  };

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto space-y-8 p-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold text-construction-primary">اختصار الروابط</h1>
          <p className="mt-2 text-muted-foreground">أنشئ روابط قصيرة قابلة للتخصيص مثل {SITE_ORIGIN}/apk03 أو {SITE_ORIGIN}/هنا.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> إنشاء رابط مختصر</CardTitle>
            <CardDescription>سيتم تحويل الزائر إلى الرابط الأصلي مع تسجيل عدد النقرات.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="target-url">الرابط الأصلي</Label>
                <Input id="target-url" type="url" dir="ltr" placeholder="https://example.com/very/long/url" value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short-slug">نص الاختصار</Label>
                <Input id="short-slug" dir="auto" placeholder="apk03 أو هنا" value={slug} onChange={(event) => setSlug(event.target.value)} required />
                <p className="text-xs text-muted-foreground" dir="ltr">{shortUrl}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short-title">اسم وصفي اختياري</Label>
                <Input id="short-title" placeholder="رابط تطبيق أبل" value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <Switch id="active-link" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="active-link">تفعيل الرابط فورًا</Label>
              </div>
              <Button type="submit" disabled={isSaving} className="w-fit">
                {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Link2 className="ml-2 h-4 w-4" />}
                إنشاء الاختصار
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>الروابط المنشورة</CardTitle><CardDescription>يمكنك تعطيل أي رابط دون حذفه.</CardDescription></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : links.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">لا توجد روابط مختصرة بعد.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>الاختصار</TableHead><TableHead>الرابط الأصلي</TableHead><TableHead>النقرات</TableHead><TableHead>الحالة</TableHead><TableHead>الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="min-w-48">
                          <div className="font-semibold">{link.title || link.slug}</div>
                          <a href={`${SITE_ORIGIN}/${encodeURIComponent(link.slug)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline" dir="ltr">
                            {SITE_ORIGIN}/{link.slug}<ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell className="max-w-72 truncate" dir="ltr" title={link.target_url}>{link.target_url}</TableCell>
                        <TableCell>{link.clicks.toLocaleString('ar-EG')}</TableCell>
                        <TableCell><Badge variant={link.is_active ? 'default' : 'secondary'}>{link.is_active ? 'نشط' : 'متوقف'}</Badge></TableCell>
                        <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => void copyLink(link.slug)} aria-label="نسخ الرابط"><Copy className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => void toggleLink(link)} aria-label="تفعيل أو تعطيل الرابط"><Power className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => void deleteLink(link)} aria-label="حذف الرابط"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default LinkShortenerPage;
