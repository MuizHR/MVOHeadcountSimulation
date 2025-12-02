import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const reportData = await req.json();

    const POWER_AUTOMATE_URL = "https://defaulte97b19be5239463599c99898cf4c3e.60.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/870a5f5bd96e45c98b5b03da4d79f923/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hq42qELKqS0yyNaZpv4v5-7EpgpjWDf6IfY_tGe_pcs";

    console.log("Sending data to Power Automate:", JSON.stringify(reportData, null, 2));

    const response = await fetch(POWER_AUTOMATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Power Automate API error:", errorText);
      throw new Error(`Power Automate request failed: ${response.statusText}`);
    }

    let result;
    try {
      result = await response.json();
    } catch (e) {
      result = { message: "Request sent successfully" };
    }

    console.log("Power Automate response:", result);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email request sent to Power Automate successfully",
        data: result
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending to Power Automate:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});