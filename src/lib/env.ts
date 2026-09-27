import "server-only";
import { z } from "zod";

const schema = z.object({
  // VoiceStudio local speech platform (ASR). Default: local backend on :3900.
  VOICESTUDIO_API_URL: z.string().default("http://127.0.0.1:3900"),
  VOICESTUDIO_API_KEY: z.string().optional().default(""),

  // Text-to-speech / voice cloning provider.
  TTS_PROVIDER: z.enum(["none", "voicestudio", "openai", "elevenlabs"]).default("none"),
  TTS_API_URL: z.string().optional().default(""),
  TTS_API_KEY: z.string().optional().default(""),
  TTS_VOICE: z.string().optional().default(""),

  // LiveKit WebRTC.
  LIVEKIT_URL: z.string().optional().default(""),
  LIVEKIT_API_KEY: z.string().optional().default(""),
  LIVEKIT_API_SECRET: z.string().optional().default(""),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (!cached) {
    cached = schema.parse(process.env);
  }
  return cached;
}

export const env: Env = new Proxy({} as Env, {
  get(_t, p: keyof Env) {
    return getEnv()[p];
  },
});
