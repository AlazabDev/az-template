export type AIResourceStatus = 'configured' | 'planned';

export interface AIModelResource {
  id: string;
  name: string;
  provider: 'Azure AI Foundry' | 'Ollama';
  status: AIResourceStatus;
}

export interface AIAgentResource {
  id: string;
  label: string;
  description: string;
  specialty: string;
  status: AIResourceStatus;
}

export interface AIToolResource {
  id: string;
  label: string;
  category: 'Toolbox' | 'MCP' | 'AI Service' | 'Connection';
  status: AIResourceStatus;
}

export const AI_MODELS: AIModelResource[] = [
  ...['GPT-5.6-Sol', 'GPT-5.6-Luna', 'GPT-5.5', 'GPT-5.4-Mini', 'GPT-5.3-Codex', 'GPT-5.1', 'DeepSeek-V4-Pro', 'Sora-2', 'Text-Embedding-3-Small'].map((name) => ({ id: name, name, provider: 'Azure AI Foundry' as const, status: 'planned' as const })),
  ...['GPT-OSS-20B', 'Qwen-3-VL-32B', 'DeepSeek-R1-14B', 'Qwen3.6-27B', 'Gemma4-E4B', 'Llama3.1-8B', 'DeepSeek-Coder-V2-16B', 'AgentBDW/GIR4B'].map((name) => ({ id: name, name, provider: 'Ollama' as const, status: 'planned' as const })),
];

export const AI_AGENTS: AIAgentResource[] = [
  ['az-agent-prod', 'الإنتاج', 'تنسيق العمليات والإنتاج', 'Production'],
  ['az-agent-maint', 'الصيانة', 'طلبات الصيانة والتشغيل', 'Maintenance'],
  ['az-agent-project', 'المشاريع', 'إدارة المشاريع والتسليمات', 'Projects'],
  ['az-agent-azabot', 'AzaBot', 'المساعد العام وخدمة العملاء', 'General Assistant'],
  ['az-agent-finance', 'المالية', 'التحليل المالي والتقارير', 'Finance'],
  ['az-agent-payments', 'المدفوعات', 'الفواتير والمدفوعات', 'Payments'],
  ['az-agent-bim', 'BIM', 'النمذجة والتنسيق الهندسي', 'BIM'],
  ['az-agent-codex', 'Codex', 'البرمجة والأتمتة', 'Coding'],
  ['az-agent-vision', 'Vision', 'تحليل الصور والمستندات', 'Vision'],
  ['az-agent-backend', 'Backend', 'الخدمات الخلفية وواجهات API', 'Backend'],
  ['az-agent-auth', 'Auth', 'المصادقة والصلاحيات', 'Authentication'],
  ['az-agent-copilot', 'Copilot', 'المساعدة التشاركية', 'Copilot'],
  ['az-agent-core', 'Core', 'التنسيق الأساسي والحوكمة', 'Core'],
  ['az-agent-sol', 'Sol', 'حلول Foundry والتحليل', 'Solutions'],
  ['daftra-agent', 'Daftra', 'المحاسبة وDaftra', 'Daftra'],
].map(([id, label, description, specialty]) => ({ id, label, description, specialty, status: 'planned' as const }));

export const AI_TOOLS: AIToolResource[] = [
  ['daftra-toolbox', 'Daftra Toolbox', 'Toolbox'],
  ['uberfix-maintenance-toolbox', 'UberFix Maintenance Toolbox', 'Toolbox'],
  ['magicplan-toolbox', 'Magicplan Toolbox', 'Toolbox'],
  ['whatsapp-toolbox', 'WhatsApp Toolbox', 'Toolbox'],
  ['az-uberfix-mcp', 'AZ UberFix MCP', 'MCP'],
  ['AzureDevOpsMCPServer', 'Azure DevOps MCP', 'MCP'],
  ['FoundryMCPServer', 'Foundry MCP', 'MCP'],
  ['AzureSpeechMCPServer', 'Azure Speech MCP', 'MCP'],
  ['Azure AI Search', 'Azure AI Search', 'AI Service'],
  ['Azure AI Vision', 'Azure AI Vision', 'AI Service'],
  ['Document Intelligence', 'Document Intelligence', 'AI Service'],
  ['Code Interpreter', 'Code Interpreter', 'AI Service'],
  ['File Search', 'File Search', 'AI Service'],
  ['Web Search', 'Web Search', 'AI Service'],
  ['A2A Agent Connections', 'A2A Agent Connections', 'Connection'],
].map(([id, label, category]) => ({ id, label, category, status: 'planned' as const }));
