import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, conversationId } = await req.json();
    const gatewayUrl = Deno.env.get("AZ_AGENT_GATEWAY_URL");
    const gatewayKey = Deno.env.get("AZ_AGENT_GATEWAY_KEY");
    if (!gatewayUrl) throw new Error("AZ_AGENT_GATEWAY_URL is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch knowledge base for context
    const { data: knowledge } = await supabase
      .from("chatbot_knowledge")
      .select("title, content, category")
      .eq("is_active", true)
      .limit(50);

    const knowledgeContext = knowledge?.length
      ? knowledge.map((k) => `### ${k.title} (${k.category})\n${k.content}`).join("\n\n---\n\n")
      : "";

    // Fetch finishing levels for pricing
    const { data: finishingLevels } = await supabase
      .from("finishing_levels")
      .select("name, price_per_sqm, description")
      .eq("is_active", true)
      .order("sort_order");

    const pricingInfo = finishingLevels?.length
      ? finishingLevels.map(fl => `- ${fl.name}: ${fl.price_per_sqm} ج.م/م² (${fl.description || ''})`).join('\n')
      : '';

    const systemPrompt = `أنت "عزبوت" (AzaBot) - المساعد الذكي لشركة العزب للمقاولات العامة. أنت مساعد ودود ومحترف يتحدث العربية بطلاقة.

## معلومات الشركة الأساسية:
- شركة العزب للمقاولات العامة - خبرة أكثر من 20 عاماً
- المقر الرئيسي: القاهرة، مصر | فروع في جدة (السعودية) والدقهلية (مصر)
- الخدمات: المقاولات العامة، التصميم المعماري، إدارة المشاريع، الصيانة والتشغيل، الاستشارات الهندسية، التطوير العقاري
- البريد: support@al-azab.co | الموقع: al-azab.co
- هاتف القاهرة: +201004006620 | جدة: +966547330897 | الدقهلية: +201014536600

## أنظمة التسعير المتاحة:

### النظام الأول: تسعير حسب المساحة
سعر المتر المربع حسب مستوى التشطيب:
${pricingInfo || 'لا تتوفر بيانات التسعير حالياً'}
**الحساب:** المساحة (م²) × سعر المتر = الإجمالي
**مثال:** شقة 100 م² تشطيب لوكس = 100 × 15,000 = 1,500,000 ج.م

### النظام الثاني: عرض سعر تفصيلي بالبنود
عرض سعر مفصل يتضمن جميع بنود الأعمال (مباني، بياض، أرضيات، دهانات، كهرباء، صحية، إلخ) مع الكميات والأسعار. يتم إعداده من خلال الإدارة الهندسية بعد معاينة الموقع.

### النظام الثالث: تنفيذ فقط (خامات على العميل)
العميل يوفر الخامات والشركة تنفذ فقط بنسبة 20% من قيمة الخامات.
**مثال:** خامات بقيمة 500,000 ج.م → تكلفة التنفيذ = 100,000 ج.م

## قاعدة المعرفة المدرّبة:
${knowledgeContext || "لا توجد بيانات تدريب إضافية حالياً."}

## تعليمات:
1. أجب دائماً بالعربية إلا إذا طُلب منك غير ذلك
2. كن محترفاً وودوداً
3. إذا سُئلت عن شيء لا تعرفه، اقترح التواصل مع الشركة مباشرة
4. استخدم المعلومات من قاعدة المعرفة أعلاه عند الإجابة
5. يمكنك المساعدة في: الاستفسار عن الخدمات، طلبات الصيانة، معلومات المشاريع، الأسعار التقريبية
6. استخدم تنسيق Markdown عند الحاجة (عناوين، قوائم، نقاط)
7. **عند سؤال العميل عن التسعير أو عرض سعر:**
   - اشرح الأنظمة الثلاثة المتاحة
   - اسأل عن نوع العقار (شقة/فيلا/محل) والمساحة
   - احسب السعر التقريبي فوراً للنظام الأول
   - للنظام الثاني والثالث، اشرح الخطوات واطلب التواصل مع الإدارة
   - انصح العميل بالتواصل مع الإدارة الهندسية للحصول على عرض سعر رسمي`;

    const response = await fetch(`${gatewayUrl.replace(/\/$/, "")}/agents/az-agent-azabot/chat`, {
      method: "POST",
      headers: {
        ...(gatewayKey ? { Authorization: `Bearer ${gatewayKey}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: "az-agent-azabot",
        model: "GPT-5.6-Sol",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools: ["File Search", "Azure AI Search"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Agent gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await response.json();
    const content = payload.content || payload.response || payload.output || payload.choices?.[0]?.message?.content;
    return new Response(JSON.stringify({ content: content || "لم يرجع الوكيل محتوى." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chatbot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
