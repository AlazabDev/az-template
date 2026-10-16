import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home, Briefcase, Phone, Calculator,
  Building2, MessageCircle, FileText, BookOpen, HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('ابحث في الموقع... (الصفحات، الخدمات، الإجراءات)', 'Search pages, services, actions...')} />
      <CommandList>
        <CommandEmpty>{t('لا توجد نتائج', 'No results found.')}</CommandEmpty>

        <CommandGroup heading={t('الصفحات الرئيسية', 'Main Pages')}>
          <CommandItem onSelect={() => go('/')}><Home className="mr-2 h-4 w-4" />{t('الرئيسية', 'Home')}</CommandItem>
          <CommandItem onSelect={() => go('/about')}><Building2 className="mr-2 h-4 w-4" />{t('من نحن', 'About')}</CommandItem>
          <CommandItem onSelect={() => go('/services')}><Briefcase className="mr-2 h-4 w-4" />{t('الخدمات', 'Services')}</CommandItem>
          <CommandItem onSelect={() => go('/projects')}><Briefcase className="mr-2 h-4 w-4" />{t('المشاريع', 'Projects')}</CommandItem>
          <CommandItem onSelect={() => go('/contact')}><Phone className="mr-2 h-4 w-4" />{t('اتصل بنا', 'Contact')}</CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('خدماتنا', 'Our Services')}>
          <CommandItem onSelect={() => go('/services')}><Briefcase className="mr-2 h-4 w-4" />{t('جميع الخدمات', 'All Services')}</CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('إجراءات سريعة', 'Quick Actions')}>
          <CommandItem onSelect={() => go('/cost-calculator')}><Calculator className="mr-2 h-4 w-4" />{t('حاسبة التكلفة', 'Cost Calculator')}</CommandItem>
          <CommandItem onSelect={() => go('/chatbot')}><MessageCircle className="mr-2 h-4 w-4" />{t('المساعد الذكي', 'AI Assistant')}</CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('المحتوى', 'Content')}>
          <CommandItem onSelect={() => go('/blogs')}><FileText className="mr-2 h-4 w-4" />{t('المدونة', 'Blog')}</CommandItem>
          <CommandItem onSelect={() => go('/knowledge')}><BookOpen className="mr-2 h-4 w-4" />{t('قاعدة المعرفة', 'Knowledge Base')}</CommandItem>
          <CommandItem onSelect={() => go('/faq')}><HelpCircle className="mr-2 h-4 w-4" />{t('الأسئلة الشائعة', 'FAQ')}</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
