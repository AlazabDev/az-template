
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface Project {
  id: string;
  name: string;
  status: string;
  location: string;
  created_at: string;
}

interface DashboardData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;
  recentProjects: Project[];
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    planningProjects: 0,
    recentProjects: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // جلب بيانات المشاريع
        const projectsQuery = await supabase
          .from('projects')
          .select('id, name, status, location, created_at');

        if (projectsQuery.error) throw projectsQuery.error;

        const projects = (projectsQuery.data || []) as Project[];

        // حساب الإحصائيات
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const planningProjects = projects.filter(p => p.status === 'planning').length;

        // آخر المشاريع (أحدث 5 مشاريع)
        const recentProjects = projects
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        setData({
          totalProjects,
          activeProjects,
          completedProjects,
          planningProjects,
          recentProjects
        });

        console.log('تم تحميل بيانات لوحة التحكم بنجاح');
      } catch (error) {
        console.error('خطأ في جلب بيانات لوحة التحكم:', error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "سيتم استخدام البيانات الافتراضية",
          variant: "destructive",
        });

        // بيانات افتراضية في حالة الخطأ
        setData({
          totalProjects: 12,
          activeProjects: 6,
          completedProjects: 3,
          planningProjects: 3,
          recentProjects: [
            {
              id: '1',
              name: 'مشروع تطوير المكاتب الإدارية',
              status: 'active',
              location: 'القاهرة',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'صيانة مبنى سكني',
              status: 'planning',
              location: 'الإسكندرية',
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, isLoading };
};
