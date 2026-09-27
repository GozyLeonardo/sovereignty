import "server-only";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { liveKitConfigured } from "@/lib/video/livekit";
import { ttsConfigured } from "@/lib/voice/tts";

export async function GET() {
  return NextResponse.json({
    transcription: env.VOICESTUDIO_API_URL !== "",
    tts: ttsConfigured(),
    ttsProvider: env.TTS_PROVIDER,
    video: liveKitConfigured(),
  });
}
