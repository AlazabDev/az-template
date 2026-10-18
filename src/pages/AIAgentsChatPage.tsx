import React, { FormEvent, useMemo, useState } from 'react';
import { Bot, Check, ChevronDown, Loader2, MessageSquare, Network, Send, Settings2, Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AI_AGENTS, AI_MODELS, AI_TOOLS } from '@/lib/aiResources';
import { supabaseConfig } from '@/integrations/supabase/config';
import AgentMessageContent from '@/components/shared/AgentMessageContent';

type ChatMessage = { role: 'user' | 'assistant'; content: string; agent?: string };
type AgentResponse = { agentId: string; content?: string; error?: string };

const MULTI_AGENT_CHAT_URL = `${supabaseConfig.url}/functions/v1/multi-agent-chat`;

const AIAgentsChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['az-agent-core']);
  const [selectedModel, setSelectedModel] = useState('GPT-5.6-Sol');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const selectedAgentLabels = useMemo(() => selectedAgents.map((id) => AI_AGENTS.find((agent) => agent.id === id)?.label || id), [selectedAgents]);

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((current) => current.includes(agentId)
      ? current.filter((id) => id !== agentId)
      : [...current, agentId]);
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools((current) => current.includes(toolId)
      ? current.filter((id) => id !== toolId)
      : [...current, toolId]);
  };

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    if (selectedAgents.length === 0) {
      toast.error('اختر وكيلاً واحدًا على الأقل قبل الإرسال');
      return;
    }

    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(MULTI_AGENT_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseConfig.publishableKey}`,
        },
        body: JSON.stringify({
          messages: nextMessages,
          agentIds: selectedAgents,
          model: selectedModel,
          toolIds: selectedTools,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'تعذر الاتصال ببوابة الوكلاء');

      const responses = (payload.responses || []) as AgentResponse[];
      const successful = responses.filter((item) => item.content);
      const failed = responses.filter((item) => item.error);
      const answer = successful.length
        ? successful.map((item) => {
          const label = AI_AGENTS.find((agent) => agent.id === item.agentId)?.label || item.agentId;
          return `### ${label}\n${item.content}`;
        }).join('\n\n---\n\n')
        : payload.content;
      if (!answer) throw new Error(failed[0]?.error || 'لم يرجع أي وكيل نتيجة');

      setMessages((current) => [...current, { role: 'assistant', content: answer, agent: selectedAgentLabels.join('، ') }]);
      if (failed.length) toast.warning(`تعذر الرد من ${failed.length} وكيل، وتم عرض الردود المتاحة`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      setMessages((current) => [...current, { role: 'assistant', content: `⚠️ ${message}` }]);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Settings2 className="h-5 w-5" /> إعداد الجلسة</CardTitle><CardDescription>اختر الوكلاء الذين سيشاركون في الإجابة.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><label htmlFor="model" className="text-sm font-medium">النموذج</label><select id="model" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><optgroup label="Azure AI Foundry">{AI_MODELS.filter((model) => model.provider === 'Azure AI Foundry').map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</optgroup><optgroup label="Ollama">{AI_MODELS.filter((model) => model.provider === 'Ollama').map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</optgroup></select></div>
                <div className="space-y-2"><p className="text-sm font-medium">الوكلاء المحددون ({selectedAgents.length})</p><div className="max-h-72 space-y-1 overflow-y-auto">{AI_AGENTS.map((agent) => <button type="button" key={agent.id} onClick={() => toggleAgent(agent.id)} className={`flex w-full items-center justify-between rounded-md border p-2 text-right text-sm transition-colors ${selectedAgents.includes(agent.id) ? 'border-construction-primary bg-construction-primary/10' : 'hover:bg-muted'}`}><span><strong className="block">{agent.label}</strong><small className="text-muted-foreground">{agent.id}</small></span>{selectedAgents.includes(agent.id) && <Check className="h-4 w-4 text-construction-primary" />}</button>)}</div></div>
                <div className="space-y-2"><p className="text-sm font-medium">الأدوات</p><div className="flex flex-wrap gap-1">{AI_TOOLS.map((tool) => <button type="button" key={tool.id} onClick={() => toggleTool(tool.id)} className={`rounded-full border px-2 py-1 text-xs ${selectedTools.includes(tool.id) ? 'border-construction-accent bg-construction-accent/20' : 'text-muted-foreground'}`}>{tool.label}</button>)}</div></div>
              </CardContent>
            </Card>
            <Card className="border-dashed"><CardContent className="p-4 text-sm text-muted-foreground"><div className="mb-2 flex items-center gap-2 font-semibold text-foreground"><Network className="h-4 w-4" /> طبقة الاتصال</div><p>الواجهة جاهزة للاتصال ببوابة الوكلاء وA2A وFoundry وOllama عبر Edge Function آمنة.</p><div className="mt-3 flex flex-wrap gap-1"><Badge variant="secondary">لا مفاتيح في المتصفح</Badge><Badge variant="outline">توجيه متعدد</Badge></div></CardContent></Card>
          </aside>

          <main className="flex min-h-[calc(100vh-3rem)] flex-col rounded-xl border bg-background shadow-sm">
            <header className="flex items-center justify-between border-b p-4"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-construction-accent text-construction-primary"><Sparkles className="h-6 w-6" /></div><div><h1 className="text-xl font-bold">مساحة الوكلاء المتعددين</h1><p className="text-sm text-muted-foreground">{selectedAgentLabels.length ? `متصل بـ: ${selectedAgentLabels.join('، ')}` : 'لم يتم اختيار وكيل'}</p></div></div><Button variant="outline" size="sm" onClick={() => setShowSettings((value) => !value)}>{showSettings ? 'إخفاء الإعدادات' : 'إظهار الإعدادات'}<ChevronDown className="mr-2 h-4 w-4" /></Button></header>
            {showSettings && <div className="border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">يمكن اختيار أكثر من وكيل لتجميع إجابات متخصصة في جلسة واحدة. حالة الموارد الفعلية تعتمد على إعداد بوابة الوكلاء في بيئة الخادم.</div>}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">{messages.length === 0 && <div className="flex min-h-[420px] flex-col items-center justify-center text-center"><MessageSquare className="mb-4 h-14 w-14 text-construction-accent" /><h2 className="text-2xl font-bold">ابدأ جلسة متعددة الوكلاء</h2><p className="mt-2 max-w-lg text-muted-foreground">أرسل سؤالًا للمشاريع أو المالية أو البرمجة، ويمكنك طلب مخطط Mermaid وسيتم عرضه تلقائيًا.</p></div>}{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === 'user' ? 'bg-construction-primary text-white' : 'bg-construction-accent text-construction-primary'}`}>{message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</div><div className={`max-w-[90%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-construction-primary text-white' : 'bg-muted'}`}>{message.role === 'assistant' ? <AgentMessageContent content={message.content} /> : <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>}</div></div>)}{isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> الوكلاء يعالجون الطلب...</div>}</div>
            <form onSubmit={sendMessage} className="border-t p-4"><div className="flex items-end gap-2"><Textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="اكتب طلبك للوكلاء..." className="min-h-12 resize-none" rows={2} disabled={isLoading} /><Button type="submit" size="icon" className="h-12 w-12 shrink-0" disabled={isLoading || !input.trim()} aria-label="إرسال"><Send className="h-5 w-5" /></Button></div><p className="mt-2 text-center text-[11px] text-muted-foreground">لا تضع مفاتيح أو بيانات سرية داخل الرسائل.</p></form>
          </main>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AIAgentsChatPage;
