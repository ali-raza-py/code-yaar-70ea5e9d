import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting check using service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: rateCheck, error: rateError } = await supabaseAdmin.rpc(
      'check_ai_rate_limit',
      { user_uuid: user.id }
    );

    if (rateError) {
      console.error("Rate limit check error:", rateError);
    } else if (rateCheck && !rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "Daily AI request limit reached. Please try again tomorrow.",
          remaining: 0,
          reset_at: rateCheck.reset_at
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Rate limit check for user ${user.id}: remaining ${rateCheck?.remaining ?? 'unknown'}`);

    const { message, context } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a patient, encouraging coding mentor helping a student learn ${context?.language || "programming"}.

Current context:
- Language: ${context?.language || "Not specified"}
- Current topic: ${context?.stepTitle || "General"}
- Concept: ${context?.stepConcept || ""}

Your role:
1. EXPLAIN concepts in simple, beginner-friendly terms
2. USE analogies and real-world examples
3. PROVIDE code examples when helpful
4. ENCOURAGE the student and celebrate progress
5. STAY FOCUSED on the current topic unless asked otherwise
6. DEBUG errors step-by-step with clear explanations
7. NEVER give complete solutions - guide them to discover answers

If the student shares code, analyze it carefully and provide constructive feedback.
Keep responses concise but thorough (2-4 paragraphs max).
Use markdown for formatting: **bold** for emphasis, \`code\` for inline code.`;

    const userMessage = context?.userCode 
      ? `${message}\n\nMy current code:\n\`\`\`${context.language}\n${context.userCode}\n\`\`\``
      : message;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service busy. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to get response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response.";

    console.log(`Learning assistant responded to user ${user.id}`);

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Learning assistant error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
