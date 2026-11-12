const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin"
});

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN;
    const origin = request.headers.get("Origin") || "";

    if (!allowedOrigin || origin !== allowedOrigin) {
      return new Response(JSON.stringify({ error: "यह वेबसाइट इस AI सेवा के लिए अनुमति प्राप्त नहीं है।" }), {
        status: 403,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const headers = corsHeaders(allowedOrigin);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "केवल POST अनुरोध स्वीकार है।" }), { status: 405, headers });
    }
    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI सेवा अभी कॉन्फ़िगर नहीं है।" }), { status: 500, headers });
    }

    try {
      const raw = await request.text();
      if (raw.length > 6000) {
        return new Response(JSON.stringify({ error: "संदेश बहुत बड़ा है। छोटा सवाल भेजें।" }), { status: 413, headers });
      }
      const body = JSON.parse(raw);
      const question = typeof body.question === "string" ? body.question.trim() : "";
      if (!question || question.length > 1000) {
        return new Response(JSON.stringify({ error: "कृपया 1 से 1000 अक्षरों के बीच सवाल लिखें।" }), { status: 400, headers });
      }

      const apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4.1-mini",
          instructions: "You are NSTC AI Teacher for students of classes 6 to 12. Answer in the language used by the student, especially simple Hindi or English. Help with school subjects, general knowledge, and ordinary questions. Explain step by step when useful, use age-appropriate language, do not provide dangerous instructions, do not request personal information, and say clearly when you are unsure. For medical, legal, financial, or official-form matters, give general information and recommend checking with a qualified adult or official source. Keep answers clear and reasonably concise.",
          input: question,
          max_output_tokens: 700
        })
      });

      const result = await apiResponse.json();
      if (!apiResponse.ok) {
        return new Response(JSON.stringify({ error: "AI सेवा से जवाब नहीं मिला। API सेटिंग या उपयोग सीमा जाँचें।" }), {
          status: 502, headers
        });
      }

      const answer = (result.output || [])
        .flatMap(item => item.content || [])
        .filter(part => part.type === "output_text")
        .map(part => part.text)
        .join("\n")
        .trim();

      return new Response(JSON.stringify({ answer: answer || "माफ कीजिए, इस बार जवाब नहीं बन पाया।" }), {
        status: 200, headers
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "सर्वर में समस्या आई। कृपया फिर कोशिश करें।" }), {
        status: 500, headers
      });
    }
  }
};
