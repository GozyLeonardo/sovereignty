import { NextResponse } from "next/server";
import { z } from "zod";
import { generateLiveKitToken, liveKitConfigured } from "@/lib/video/livekit";

const schema = z.object({
  room: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  identity: z.string().min(1).max(64),
  name: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  if (!liveKitConfigured()) {
    return NextResponse.json({ error: "Video calls are not configured." }, { status: 503 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { token, url } = await generateLiveKitToken(parsed.data);
    return NextResponse.json({ token, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a call token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
