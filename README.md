# StoryVerse AI

Next.js frontend + server-side OpenRouter API route. The OpenRouter key is read only on the server from `OPENROUTER_API_KEY`.

## Run locally

```bash
npm install
```

Create `.env.local` with:

```env
OPENROUTER_API_KEY=your_key
```

Then run:

```bash
npm run dev
```

## Deploy on Vercel

Import this repository into Vercel, keep the framework preset as **Next.js**, and add `OPENROUTER_API_KEY` under **Project Settings → Environment Variables**. Redeploy after adding the variable.
