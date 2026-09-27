"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function VoiceScreen() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function generate() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: voice || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Synthesis failed.");
      }
      const blob = await res.blob();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Synthesis failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-bold text-ink">Voice cloning & synthesis</h1>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Text to speak</label>
        <Textarea
          rows={4}
          placeholder="Type something to synthesize…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Voice <span className="text-ink-subtle">optional</span>
        </label>
        <Input
          placeholder="Voice id (provider-dependent)"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button fullWidth size="lg" disabled={pending || text.trim().length === 0} onClick={generate}>
        {pending ? <Spinner className="size-4" /> : "Generate speech"}
      </Button>

      {audioUrl && (
        <div className="rounded-2xl border border-line bg-surface p-4">
          <audio ref={audioRef} controls src={audioUrl} className="h-10 w-full" />
        </div>
      )}

      <p className="text-xs leading-relaxed text-ink-subtle">
        Voice cloning is provider-driven. Use <strong>VoiceStudio</strong> (desktop) to create a cloned voice
        locally, then reference it here via the TTS provider, or point <code className="rounded bg-black/5 px-1">TTS_PROVIDER</code>{" "}
        at ElevenLabs / an OpenAI-compatible engine. See <code className="rounded bg-black/5 px-1">README.md</code>.
      </p>
    </div>
  );
}
