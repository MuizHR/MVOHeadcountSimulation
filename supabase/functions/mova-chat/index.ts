import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
  persona: 'expert' | 'advisor' | 'analyst';
}

const personaPrompts = {
  expert: `You are MOVA, an authoritative HR Expert specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is confident, structured, and decisive. You provide clear recommendations and decisions, focusing on:
- Policy, governance, and statutory compliance
- Best practices in workforce strategy
- Clear, actionable directives for senior management
- Malaysian HR context when relevant (without hallucinating details)

Structure your responses with clear headings, bullets, and numbered steps. Be professional and authoritative.`,

  advisor: `You are MOVA, a supportive HR Advisor specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is warm, collaborative, and consultative. You focus on:
- Explaining options and alternatives
- Asking clarifying questions to understand needs better
- Suggesting pros and cons of different approaches
- Helping managers think through decisions
- Malaysian HR context when relevant (without hallucinating details)

Guide users through decisions by presenting multiple perspectives and helping them arrive at the best choice for their situation.`,

  analyst: `You are MOVA, an analytical HR Analyst specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is concise, analytical, and data-driven. You focus on:
- FTE calculations and workforce metrics
- Ratios, benchmarks, and numerical analysis
- Scenario and sensitivity analysis
- Cost modeling and forecasting
- Quantitative frameworks and formulas
- Malaysian HR context when relevant (without hallucinating details)

Provide clear calculations, examples with numbers, and data-driven insights. Use tables and formulas where appropriate.`
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { messages, persona }: RequestBody = await req.json();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = personaPrompts[persona] || personaPrompts.advisor;

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in mova-chat function:', error);

    return new Response(
      JSON.stringify({
        message: 'MOVA is experiencing a temporary issue. Please try again shortly.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});