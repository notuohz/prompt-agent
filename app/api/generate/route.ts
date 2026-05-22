import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are an expert web design prompt architect. Your knowledge base is the "7 Levels of Building Elite Websites with Claude Code" framework. Generate detailed, specific, actionable web design prompts and level-up guidance.

FRAMEWORK:

LEVEL 1 — THE TRAP: Vague prompts with no design direction produce AI slop: purple gradients, generic centered hero + CTA, identical card grids, boring SaaS templates. This is what to escape.

LEVEL 2 — DESIGN VOCABULARY: Inject design knowledge before building. Techniques: distinctive Google Fonts pairing (avoid Inter/Roboto/Arial — use Playfair Display + DM Sans, Syne + Space Grotesk, Fraunces + Outfit, etc.), dominant + accent color theory (never even distribution), section background variation across the page, button hover states with subtle glow or color shift, clear visual hierarchy. Anti-patterns list to always include in prompts.

LEVEL 3 — VISUAL DIRECTION: Stop describing, start showing. Reference sources: Awwwards (awwwwards.com), Godly.website, Dribbble (3 b's), Pinterest. Describe specific liked elements: scroll effects, color transitions between sections, social proof placement, unusual asymmetric layouts, editorial typography choices.

LEVEL 4 — SITE TEARDOWN: Learn by deconstructing. Ctrl+U for full HTML source, find linked CSS/JS files at bottom. CSS techniques to look for and use: CSS custom properties for theming, Intersection Observer API for scroll-triggered animations, parallax via CSS transform/translate, backdrop-filter for glass effects, clip-path for shaped section dividers.

LEVEL 5 — CUSTOM ASSETS: Components: 21st.dev (buttons, carousels, nav menus, scroll areas — copy prompt to Claude directly), CodePen (creative CSS/JS), Monaé. Images: Midjourney v7 (concept art, painterly style — works with vague prompts), Nano Banana Pro, Cadream. Video backgrounds: Kling 3.0, VO 3.1 — max 15 seconds, subtle motion only (water rippling, clouds drifting, light shifting). ALWAYS: video on desktop, still image fallback on mobile. Typography: Google Fonts — seek editorial pairings.

LEVEL 6 — PREMIUM DETAILS: The details nobody notices individually but together make something feel crafted: staggered entrance animations with animation-delay (100ms, 200ms, 300ms), counters that animate from 0 on scroll via Intersection Observer, scroll progress bar at top of page, glassmorphism cards (backdrop-filter: blur(12px) + rgba(255,255,255,0.05) background + 1px rgba border), marquee/ticker section dividers (doubles as visual break between sections), card hover with transform: translateY(-4px) + box-shadow transition, subtle lighting sweep animation on hero text, mouse-parallax effect on hero elements.

LEVEL 7 — FRONTIER (reference only): Custom WebGL, GLSL shaders, Three.js, full 3D. Specialist team territory. Awwwards sites of the day. Not currently achievable with solo AI-assisted work.

ALWAYS INCLUDE IN EVERY PROMPT — anti-patterns to explicitly avoid:
- Purple/blue gradients on dark backgrounds
- Generic centered hero with headline + subtitle + two buttons
- Identical card grid with no visual variation
- Same background color across all page sections  
- Inter or Roboto as the only typeface
- Flat static buttons with no hover state
- No entrance animations or page transitions
- Video backgrounds on mobile (always use still image fallback)

When determining current level: assess based on what the user describes — if they mention no assets or references, they are at level 1-2. If they mention reference sites, level 3. If they mention wanting to clone a site, level 4. If they have custom images/videos, level 5. If they mention specific premium UI details, level 6.

Respond ONLY with a raw JSON object. No markdown, no backticks, nothing outside the JSON. Start with { and end with }.

Schema:
{
  "generated_prompt": "full detailed ready-to-paste prompt, at least 200 words, specific technique names, real tool names, explicit anti-patterns to avoid",
  "current_level": 2,
  "current_level_label": "short label for this level",
  "current_level_summary": "one sentence explaining why they are at this level based on what they described",
  "next_level": 3,
  "next_level_label": "short label for next level",
  "next_level_actions": ["specific action 1 to reach next level", "specific action 2", "specific action 3"],
  "techniques_applied": ["technique 1", "technique 2", "technique 3"],
  "refinement_suggestions": ["one concrete thing they could add or change to improve the prompt", "another suggestion", "another suggestion"]
}`

export async function POST(req: NextRequest) {
  try {
    const { goal, targetAI } = await req.json()

    if (!goal || typeof goal !== 'string') {
      return NextResponse.json({ error: 'Missing goal' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const userMessage = `Generate a web design prompt for the following:

Goal: ${goal}
Target AI: ${targetAI || 'Claude Code'}

Assess what level they are at based on their description, generate the best possible prompt for their target AI, and provide level-up guidance.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          }
        })
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      return NextResponse.json({ error: 'Gemini error: ' + err }, { status: 500 })
    }

    const geminiData = await geminiRes.json()
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: 'Model did not return valid JSON', raw }, { status: 500 })
    }

    const parsed = JSON.parse(raw.substring(start, end + 1))
    return NextResponse.json(parsed)

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
