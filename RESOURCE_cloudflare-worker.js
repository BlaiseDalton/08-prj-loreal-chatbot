// Copy this code into your Cloudflare Worker script.
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    // Let the browser check CORS before it sends the chat request.
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405, corsHeaders);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse(
        { error: "The Worker is missing its OPENAI_API_KEY secret." },
        500,
        corsHeaders,
      );
    }

    let userInput;
    try {
      userInput = await request.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, 400, corsHeaders);
    }

    if (!Array.isArray(userInput.messages)) {
      return jsonResponse({ error: "Request must include a messages array." }, 400, corsHeaders);
    }

    let response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: userInput.messages,
          max_completion_tokens: 300,
        }),
      });
    } catch {
      return jsonResponse(
        { error: "The Worker could not connect to OpenAI." },
        502,
        corsHeaders,
      );
    }

    const responseBody = await response.text();
    return new Response(responseBody, {
      status: response.status,
      headers: corsHeaders,
    });
  },
};

// Return JSON responses with CORS headers so browser errors stay visible.
function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers });
}
