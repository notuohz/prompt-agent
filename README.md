# Prompt Architect

Generate expert-level web design prompts based on the **7 Levels of Building Elite Websites** framework. Paste the output into Claude Code, ChatGPT, Midjourney, or any AI tool.

## What it does

1. You describe what you want to build
2. It generates a detailed, level-aware prompt ready to paste into your AI
3. Shows your current design level and exactly what to do to reach the next one
4. Suggests refinements to make the prompt stronger
5. Optional: add more context to refine the prompt further

## Stack

- **Next.js 14** (App Router)
- **Gemini 1.5 Flash** — free tier, 1,500 requests/day, no credit card needed
- **Tailwind CSS**
- Deployable to **Vercel** in ~5 minutes

---


## Run locally

```bash
# Install dependencies
npm install

# Create your env file
cp .env.example .env.local
# Then edit .env.local and add your Gemini API key

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
prompt-agent/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # Gemini API call (server-side, key is secret)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main UI
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## Gemini free tier limits

- 1,500 requests per day
- 1 million tokens per minute
- No credit card required
- If you exceed limits, requests return a 429 error (the UI will show a friendly error message)

---

## Adding more frameworks later

The framework knowledge lives entirely in `app/api/generate/route.ts` in the `SYSTEM_PROMPT` constant. To expand beyond the 7 Levels video, just add to that string. No other files need to change.
