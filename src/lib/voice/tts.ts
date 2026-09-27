import "server-only";
import { env } from "@/lib/env";

/**
 * Text-to-speech / voice cloning provider abstraction.
 *
 * The web app stays provider-agnostic: switch TTS_PROVIDER to route synthesis
 * to a self-hosted engine, VoiceStudio's backend, or a hosted API. This is the
 * seam where "realistic voice processes" (cloning, multi-voice TTS) plug in.
 */

export interface TtsRequest {
  text: string;
  voice?: string;
  /** Optional reference audio for voice cloning (provider-dependent). */
  referenceAudio?: Buffer;
  language?: string;
}

export interface TtsResult {
  audio: Buffer;
  contentType: string;
}

export async function synthesizeSpeech(req: TtsRequest): Promise<TtsResult> {
  switch (env.TTS_PROVIDER) {
    case "openai":
      return openAiTts(req);
    case "elevenlabs":
      return elevenLabsTts(req);
    case "voicestudio":
      return voiceStudioTts(req);
    default:
      throw new Error("No TTS provider configured. Set TTS_PROVIDER.");
  }
}

export function ttsConfigured(): boolean {
  return env.TTS_PROVIDER !== "none";
}

async function openAiTts(req: TtsRequest): Promise<TtsResult> {
  const url = `${env.TTS_API_URL || "https://api.openai.com/v1"}/audio/speech`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TTS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      voice: req.voice || env.TTS_VOICE || "alloy",
      input: req.text,
      response_format: "mp3",
    }),
  });
  if (!res.ok) throw new Error(`TTS failed (${res.status})`);
  return { audio: Buffer.from(await res.arrayBuffer()), contentType: "audio/mpeg" };
}

async function elevenLabsTts(req: TtsRequest): Promise<TtsResult> {
  const voice = req.voice || env.TTS_VOICE;
  if (!voice) throw new Error("ElevenLabs requires TTS_VOICE (a voice id).");
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: {
      "xi-api-key": env.TTS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: req.text, model_id: "eleven_multilingual_v2" }),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS failed (${res.status})`);
  return { audio: Buffer.from(await res.arrayBuffer()), contentType: "audio/mpeg" };
}

async function voiceStudioTts(req: TtsRequest): Promise<TtsResult> {
  const url = `${env.VOICESTUDIO_API_URL}/v1/audio/speech`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: req.text, voice: req.voice || env.TTS_VOICE || "default" }),
  });
  if (!res.ok) throw new Error(`VoiceStudio TTS failed (${res.status})`);
  return { audio: Buffer.from(await res.arrayBuffer()), contentType: "audio/wav" };
}
