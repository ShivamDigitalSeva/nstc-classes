// NSTC AI Teacher: मुफ़्त Google Gemini वाला Cloudflare Worker
// Settings > Variables and Secrets में ये जोड़ें:
//   Secret   : GEMINI_API_KEY  = Google AI Studio से बनी key
//   Variable : ALLOWED_ORIGIN  = https://shivamdigitalseva.github.io   (आख़िर में /nstc-classes नहीं)
//   Variable (वैकल्पिक): GEMINI_MODEL = gemini-2.5-flash   (मॉडल बदलना हो तो)

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin"
});

const SYSTEM_PROMPT =
  "You are NSTC AI Teacher for students of classes 6 to 12. Answer in the language used by the student, especially simple Hindi or English. " +
  "Help with school subjects, general knowledge, and ordinary questions. Explain step by step when useful, use age-appropriate language, " +
  "do not provide dangerous instructions, do not request personal information, and say clearly when you are unsure. " +
  "For medical, legal, financial, or official-form matters, give general information and recommend checking with a qualified adult or official source. " +
  "Keep answers clear and reasonably concise.";

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
    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI सेवा अभी कॉन्फ़िगर नहीं है।" }), { status: 500, headers });
    }

    try {
      const raw = await request.text();
      if (raw.length > 16000) {
        return new Response(JSON.stringify({ error: "संदेश बहुत बड़ा है। छोटा सवाल भेजें।" }), { status: 413, headers });
      }
      const body = JSON.parse(raw);
      const question = typeof body.question === "string" ? body.question.trim() : "";
      if (!question || question.length > 1000) {
        return new Response(JSON.stringify({ error: "कृपया 1 से 1000 अक्षरों के बीच सवाल लिखें।" }), { status: 400, headers });
      }

      // पिछली बातचीत: अधिकतम 6 संदेश (Gemini में assistant की जगह role "model" होता है)
      const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
      const past = history
        .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content.slice(0, 1200) }] }));
      while (past.length && past[0].role !== "user") past.shift(); // बातचीत हमेशा user से शुरू हो

      const model = env.GEMINI_MODEL || "gemini-2.5-flash";
      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [...past, { role: "user", parts: [{ text: question }] }],
            generationConfig: { maxOutputTokens: 1500 }
          })
        }
      );

      if (apiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "अभी बहुत लोग AI इस्तेमाल कर रहे हैं। थोड़ी देर बाद फिर कोशिश करें।" }), { status: 429, headers });
      }
      const result = await apiResponse.json();
      if (!apiResponse.ok) {
        return new Response(JSON.stringify({ error: "AI सेवा से जवाब नहीं मिला। API key और मॉडल का नाम जाँचें।" }), { status: 502, headers });
      }

      const answer = ((result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) || [])
        .map(part => part.text || "")
        .join("")
        .trim();

      return new Response(JSON.stringify({ answer: answer || "माफ कीजिए, इस बार जवाब नहीं बन पाया।" }), {
        status: 200, headers
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "सर्वर में समस्या आई। कृपया फिर कोशिश करें।" }), { status: 500, headers });
    }
  }
};
