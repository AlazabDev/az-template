import React from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { useLanguage } from '@/contexts/LanguageContext';

const LABELS_AR: Record<string, string> = {
  about: 'من نحن',
  contact: 'اتصل بنا',
  services: 'الخدمات',
  projects: 'المشاريع',
  portfolio: 'معرض الأعمال',
  'maintenance-services': 'خدمات الصيانة',
  'cost-calculator': 'حاسبة التكاليف',
  blogs: 'المدونة',
  knowledge: 'قاعدة المعرفة',
  brands: 'العلامات التجارية',
  guidance: 'الإرشادات',
  faq: 'الأسئلة الشائعة',
  'privacy-policy': 'سياسة الخصوصية',
  'terms-of-service': 'الشروط والأحكام',
  'cookie-policy': 'سياسة الكوكيز',
  'refund-policy': 'سياسة الاسترداد',
  disclaimer: 'إخلاء المسؤولية',
  security: 'الأمان',
  sitemap: 'خريطة الموقع',
  ceo: 'الرئيس التنفيذي',
};

const LABELS_EN: Record<string, string> = {
  about: 'About',
  contact: 'Contact',
  services: 'Services',
  projects: 'Projects',
  portfolio: 'Portfolio',
  'maintenance-services': 'Maintenance Services',
  'cost-calculator': 'Cost Calculator',
  blogs: 'Blog',
  knowledge: 'Knowledge',
  brands: 'Brands',
  guidance: 'Guidance',
  faq: 'FAQ',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  'cookie-policy': 'Cookie Policy',
  'refund-policy': 'Refund Policy',
  disclaimer: 'Disclaimer',
  security: 'Security',
  sitemap: 'Sitemap',
  ceo: 'CEO',
};

const prettify = (slug: string) =>
  decodeURIComponent(slug).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const AutoBreadcrumb: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const labels = language === 'ar' ? LABELS_AR : LABELS_EN;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const items: BreadcrumbItem[] = segments.map((seg, i) => ({
    label: labels[seg] || prettify(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));

  return <Breadcrumb items={items} className={`mb-4 ${className}`} />;
};

export default AutoBreadcrumb;
