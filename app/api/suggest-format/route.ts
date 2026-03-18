import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const { title } = await request.json();

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 50,
    messages: [{
      role: 'user',
      content: `Classify this TikTok video title into exactly one of these format categories:
- Shouty Hook (attention-grabbing opening, direct call-out, problem/solution)
- Storytelling (narrative, personal story, journey)
- BOFU Text-Led (bottom of funnel, product features, text-heavy, educational)
- Wife Skit (involves wife/partner, skit format)
- Skit (acting, roleplay, comedy skit)
- Other (doesn't fit above)

Video title: "${title}"

Reply with ONLY the category name, nothing else.`
    }]
  });

  const suggested = (message.content[0] as { text: string }).text.trim();
  return NextResponse.json({ suggested });
}
