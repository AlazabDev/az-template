import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedAgents = new Set([
  "az-agent-prod", "az-agent-maint", "az-agent-project", "az-agent-azabot", "az-agent-finance",
  "az-agent-payments", "az-agent-bim", "az-agent-codex", "az-agent-vision", "az-agent-backend",
  "az-agent-auth", "az-agent-copilot", "az-agent-core", "az-agent-sol", "daftra-agent",
]);

const normalizeResult = (agentId: string, payload: Record<string, unknown>) => {
  const content = payload.content || payload.response || payload.output ||
    (Array.isArray(payload.choices) ? (payload.choices[0] as Record<string, unknown>)?.message : undefined);
  return { agentId, content: typeof content === "string" ? content : JSON.stringify(content || payload) };
};

async function callConfiguredAgent(agentId: string, model: string, messages: unknown[], toolIds: string[]) {
  const gatewayUrl = Deno.env.get("AZ_AGENT_GATEWAY_URL");
  const gatewayKey = Deno.env.get("AZ_AGENT_GATEWAY_KEY");
  if (!gatewayUrl) throw new Error("بوابة الوكلاء غير مهيأة. اضبط AZ_AGENT_GATEWAY_URL في بيئة Supabase.");

  const response = await fetch(`${gatewayUrl.replace(/\/$/, "")}/agents/${encodeURIComponent(agentId)}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(gatewayKey ? { Authorization: `Bearer ${gatewayKey}` } : {}),
    },
    body: JSON.stringify({ agent_id: agentId, model, messages, tools: toolIds }),
  });
  if (!response.ok) throw new Error(`Agent ${agentId} returned ${response.status}`);
  return normalizeResult(agentId, await response.json());
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const agentIds = Array.isArray(body.agentIds) ? body.agentIds.filter((id: unknown): id is string => typeof id === "string" && allowedAgents.has(id)).slice(0, 5) : [];
    const model = typeof body.model === "string" ? body.model : "GPT-5.6-Sol";
    const toolIds = Array.isArray(body.toolIds) ? body.toolIds.filter((id: unknown): id is string => typeof id === "string").slice(0, 20) : [];
    if (!messages.length || !agentIds.length) throw new Error("يجب إرسال رسالة واختيار وكيل واحد على الأقل.");

    if (!Deno.env.get("AZ_AGENT_GATEWAY_URL")) {
      return new Response(JSON.stringify({ error: "بوابة الوكلاء غير مهيأة. اضبط AZ_AGENT_GATEWAY_URL في بيئة Supabase." }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const settled = await Promise.allSettled(agentIds.map((agentId) => callConfiguredAgent(agentId, model, messages, toolIds)));
    const responses = settled.map((result, index) => result.status === "fulfilled"
      ? result.value
      : { agentId: agentIds[index], error: result.reason instanceof Error ? result.reason.message : "تعذر الاتصال بالوكيل" });
    return new Response(JSON.stringify({ mode: "gateway", responses }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "خطأ غير معروف" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
