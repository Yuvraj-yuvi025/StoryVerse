import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

export async function POST(request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server is missing OPENROUTER_API_KEY. Add it in Vercel project settings." }, { status: 500 });
  }

  try {
    const { theme, genre, context = "", decision = "", isFirst = true } = await request.json();
    if (!theme?.trim() || !genre) {
      return NextResponse.json({ error: "Please provide a story theme and genre." }, { status: 400 });
    }

    const system = `You are StoryVerse, an immersive interactive fiction engine. Write vivid but concise chapters (350-500 words max). Maintain continuity with the supplied story memory. Make the user's decision meaningfully affect events. Introduce memorable characters and consequences. End every chapter with exactly three numbered choices under NEXT CHOICES. Finish with a compact STORY MEMORY section containing current characters and important events. Do not restart the story.`;
    const user = isFirst
      ? `Create chapter 1.\nTHEME: ${theme}\nGENRE: ${genre}\nEstablish a compelling setting, introduce 2-3 memorable characters, and create a strong opening conflict. End with exactly three choices and compact story memory.`
      : `Continue this same story with chapter ${context ? "in progress" : "2"}.\nTHEME: ${theme}\nGENRE: ${genre}\nPREVIOUS STORY MEMORY AND RECENT EVENTS:\n${context}\n\nUSER'S LATEST DECISION: ${decision}\nMake the decision change what happens next. Keep continuity and end with exactly three choices and updated compact story memory.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://storyverse-ai.vercel.app",
        "X-Title": "StoryVerse AI",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        temperature: 0.8,
        max_tokens: 1400,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "The story service is temporarily unavailable." }, { status: response.status });
    }
    const story = data?.choices?.[0]?.message?.content;
    if (!story) return NextResponse.json({ error: "The AI returned an empty chapter. Please try again." }, { status: 502 });
    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 500 });
  }
}
