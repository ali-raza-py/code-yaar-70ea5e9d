import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Model mapping for Lovable AI gateway - Updated with latest models
const modelMapping: Record<string, string> = {
  "gemini-3-flash-preview": "google/gemini-3-flash-preview",
  "gemini-3-pro-preview": "google/gemini-3-pro-preview",
  "gemini-2.5-flash": "google/gemini-2.5-flash",
  "gemini-2.5-pro": "google/gemini-2.5-pro",
  "gpt-5": "openai/gpt-5",
  "gpt-5-mini": "openai/gpt-5-mini",
  "gpt-5.2": "openai/gpt-5.2",
};

// Enhanced system prompts for professional, syntax-aware responses
const systemPrompts = {
  generate: `You are an expert coding assistant specializing in educational code generation.
Your role is to generate clean, well-documented, and SAFE code that helps students learn.

CRITICAL RULES:
- NEVER generate malicious, harmful, or unsafe code (no system commands, file deletions, network exploits)
- NEVER generate code that could damage systems or compromise security
- If the request is unclear or potentially harmful, respond with: "I'm not certain about this request. Please provide more details or verify the intent."
- Always include comments explaining key concepts
- Use best practices and idiomatic code patterns
- Provide clear, descriptive variable names
- Structure code in a readable, maintainable way
- Include error handling where appropriate
- For Python: use type hints, docstrings, and PEP 8 style
- For JavaScript: use modern ES6+ syntax, async/await patterns
- For C++: include proper headers, use RAII patterns
- For HTML/CSS: use semantic elements, accessibility best practices

FORMAT YOUR RESPONSE:
- Use markdown headers (##, ###) for sections
- Wrap code in \`\`\`language code blocks
- Separate code from explanations clearly
- Use bullet points for key points
- Highlight important warnings`,

  debug: `You are an expert debugging assistant for coding education.
Your role is to help students find and fix errors in their code.

CRITICAL RULES:
- NEVER suggest fixes that could introduce security vulnerabilities
- If unsure about a fix, state: "I'm not certain about this solution. Please verify before using."
- Identify ALL syntax and logic issues in the code
- Explain WHY each issue is a problem in simple terms
- Provide corrected code with fixes clearly marked
- Teach the student how to avoid similar errors
- Suggest debugging strategies and tools
- Be encouraging and educational
- Highlight common pitfalls for the specific language

FORMAT YOUR RESPONSE:
## Issues Found
List each issue with explanation

## Corrected Code
\`\`\`language
corrected code here
\`\`\`

## Explanation
Step by step explanation of fixes`,

  explain: `You are an expert code explanation assistant.
Your role is to help students understand how code works step by step.

GUIDELINES:
- Break down the code into logical sections
- Explain each part in simple, beginner-friendly terms
- Describe the execution flow and what happens at runtime
- Highlight important programming concepts and patterns
- Use analogies when helpful for understanding
- Point out any potential issues or improvements
- Explain time/space complexity when relevant
- Connect concepts to broader programming principles

FORMAT YOUR RESPONSE:
## Overview
Brief summary of what the code does

## Step-by-Step Breakdown
Detailed explanation with code snippets

## Key Concepts
Important programming concepts used

## Tips & Best Practices
Suggestions for improvement`
};

// Expanded safety filter for potentially harmful requests
const unsafePatterns = [
  /rm\s+-rf/i,
  /format\s+c:/i,
  /deltree/i,
  /rmdir\s+\/s/i,
  /del\s+\/f/i,
  /system\s*\(/i,
  /exec\s*\(/i,
  /eval\s*\(/i,
  /subprocess/i,
  /os\.system/i,
  /shell_exec/i,
  /popen\s*\(/i,
  /child_process/i,
  /socket\.connect/i,
  /urllib.*request/i,
  /reverse.?shell/i,
  /bind.?shell/i,
  /netcat|nc\s+-/i,
  /password.*crack/i,
  /brute.?force/i,
  /sql.?injection/i,
  /xss.?attack/i,
  /csrf.?attack/i,
  /hack/i,
  /exploit/i,
  /malware/i,
  /virus/i,
  /keylogger/i,
  /phishing/i,
  /ransomware/i,
  /trojan/i,
  /rootkit/i,
  /botnet/i,
  /privilege.?escalation/i,
  /sudo.?bypass/i,
  /root.?access/i,
];

function containsUnsafeContent(text: string): boolean {
  return unsafePatterns.some(pattern => pattern.test(text));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate user with getUser
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    const { data: rateCheck, error: rateError } = await supabaseAdmin.rpc(
      'check_ai_rate_limit', 
      { user_uuid: user.id }
    );

    if (rateError) {
      console.error("Rate limit check error:", rateError);
    } else if (rateCheck && !rateCheck.allowed) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: "Daily AI request limit reached. Please try again tomorrow.",
          remaining: 0,
          reset_at: rateCheck.reset_at
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { mode, code, language, model = "gemini-2.5-flash" } = await req.json();

    if (!mode || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (code.length > 50000) {
      return new Response(
        JSON.stringify({ error: "Input too long. Maximum 50,000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (containsUnsafeContent(code)) {
      console.warn(`Unsafe content detected from user ${user.id}`);
      
      await supabaseAdmin.from('ai_chat_history').insert({
        user_id: user.id,
        title: `[BLOCKED] ${mode} - ${language}`,
        language,
        messages: [{ role: 'user', content: '[CONTENT BLOCKED FOR SAFETY]' }]
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Request blocked for security reasons.",
          warning: true 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.generate;
    
    const languageContextMap: Record<string, string> = {
      python: "Programming language: Python 3.x. Use type hints, docstrings, and follow PEP 8.",
      cpp: "Programming language: C++17 or later. Use modern C++ features and RAII patterns.",
      javascript: "Programming language: JavaScript (ES6+). Use modern syntax, async/await, and best practices.",
      typescript: "Programming language: TypeScript. Use strict types, interfaces, and modern patterns.",
      java: "Programming language: Java 17+. Use modern features, streams, and follow conventions.",
      csharp: "Programming language: C# 11+. Use modern .NET patterns and LINQ.",
      go: "Programming language: Go. Use idiomatic Go patterns, error handling, and goroutines.",
      rust: "Programming language: Rust. Use ownership, borrowing, and safe patterns.",
      sql: "Database: SQL. Write efficient, secure queries. Always use parameterized queries.",
      html: "Technologies: HTML5 and CSS3. Use semantic elements and accessibility best practices.",
    };
    
    const languageContext = languageContextMap[language] || `Programming language: ${language}`;

    let userMessage = "";
    switch (mode) {
      case "generate":
        userMessage = `${languageContext}\n\nGenerate clean, well-documented, and SAFE code for:\n\n${code}`;
        break;
      case "debug":
        userMessage = `${languageContext}\n\nDebug this code. Identify issues, explain them, and provide corrected code:\n\n${code}`;
        break;
      case "explain":
        userMessage = `${languageContext}\n\nExplain this code step by step for a beginner:\n\n${code}`;
        break;
      default:
        userMessage = code;
    }

    // Map model to Lovable AI gateway format - default to latest fast model
    const aiModel = modelMapping[model] || "google/gemini-3-flash-preview";

    console.log(`Processing ${mode} request for ${language || "unknown"} with model ${aiModel} by user ${user.id}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service limit reached. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`AI request successful for user ${user.id}, mode: ${mode}, model: ${aiModel}, remaining: ${rateCheck?.remaining ?? 'unknown'}`);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Code Assistant error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
