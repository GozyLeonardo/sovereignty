import "server-only";
import { env } from "@/lib/env";

/**
 * VoiceStudio local speech platform client (transcription / STT).
 *
 * VoiceStudio's Python backend exposes an OpenAI-compatible transcription
 * endpoint on port 3900. We proxy audio through our server so the browser never
 * needs a direct network path to the local backend (and so the optional API key
 * stays server-side).
 */

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

export async function transcribeAudio(
  audio: Blob | Buffer,
  opts: { filename?: string; mimeType?: string } = {},
): Promise<TranscriptionResult> {
  if (env.VOICESTUDIO_API_URL === "") {
    throw new Error("VoiceStudio is not configured.");
  }

  const form = new FormData();
  form.append(
    "file",
    new Blob([audio as BlobPart], { type: opts.mimeType ?? "audio/webm" }),
    opts.filename ?? "recording.webm",
  );
  form.append("model", "sherpa-onnx");
  form.append("response_format", "json");

  const headers: Record<string, string> = {};
  if (env.VOICESTUDIO_API_KEY) {
    headers.Authorization = `Bearer ${env.VOICESTUDIO_API_KEY}`;
  }

  const res = await fetch(
    `${env.VOICESTUDIO_API_URL}/v1/audio/transcriptions`,
    { method: "POST", headers, body: form },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Transcription failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as { text?: string; language?: string; duration?: number };
  if (typeof data.text !== "string") {
    throw new Error("Transcription returned no text.");
  }

  return { text: data.text, language: data.language, duration: data.duration };
}

/** True when a VoiceStudio backend is configured. */
export function voiceStudioConfigured(): boolean {
  return env.VOICESTUDIO_API_URL !== "";
}
