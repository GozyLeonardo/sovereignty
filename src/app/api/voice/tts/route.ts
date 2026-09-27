import { NextResponse } from "next/server";
import { z } from "zod";
import { synthesizeSpeech } from "@/lib/voice/tts";

const schema = z.object({
  text: z.string().min(1).max(5000),
  voice: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const result = await synthesizeSpeech({ text: parsed.data.text, voice: parsed.data.voice });
    return new NextResponse(new Uint8Array(result.audio), {
      headers: { "Content-Type": result.contentType },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Speech synthesis failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
