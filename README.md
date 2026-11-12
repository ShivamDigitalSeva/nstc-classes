# NSTC Classes + AI Teacher

## Website files
- `index.html` — GitHub Pages website with AI chat widget
- `images/` — logo and four teacher photos
- `worker.js` — Cloudflare Worker backend; keeps the OpenAI API key server-side

## Important setup
1. Deploy `worker.js` as a Cloudflare Worker.
2. In Worker Settings > Variables and Secrets, add:
   - Secret: `OPENAI_API_KEY` = your OpenAI API key
   - Variable: `ALLOWED_ORIGIN` = `https://YOUR-GITHUB-USERNAME.github.io`
   - Optional variable: `OPENAI_MODEL` = `gpt-4.1-mini`
3. In `index.html`, replace `PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE` with the deployed Worker URL.
4. Upload `index.html` and the complete `images` folder to the root of your GitHub Pages repository.

## Security notes
- Never put the OpenAI API key in `index.html`, GitHub, or a public repository.
- Use API access only with the account owner's permission; API usage may cost money and is subject to provider limits.
- Ask a parent/guardian or responsible adult to handle provider account setup, billing, and secret management.
- Set `ALLOWED_ORIGIN` to your exact GitHub Pages origin. Do not use `*`.
- This starter includes origin checking and request-size limits, but production use should also add rate limiting/abuse protection and monitor usage.
- The chatbot sends the student's question to the AI provider. Tell students not to enter passwords, phone numbers, addresses, or other private information.
