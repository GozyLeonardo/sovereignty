"use client";

import { useEffect, useState } from "react";

type Status = {
  transcription: boolean;
  tts: boolean;
  ttsProvider: string;
  video: boolean;
};

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        ok ? "bg-brand-50 text-brand-700" : "bg-black/5 text-ink-muted"
      }`}
    >
      <span className={`size-1.5 rounded-full ${ok ? "bg-brand-600" : "bg-ink-subtle"}`} />
      {label}
    </span>
  );
}

export function StatusBadges() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Badge ok={status.transcription} label="Transcription" />
      <Badge ok={status.tts} label={`Voice (${status.ttsProvider})`} />
      <Badge ok={status.video} label="Video calls" />
    </div>
  );
}
