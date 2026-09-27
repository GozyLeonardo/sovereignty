import Link from "next/link";
import { Shell } from "@/components/shell/shell";
import { StatusBadges } from "@/components/home/status-badges";

export default function HomePage() {
  return (
    <Shell>
      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sovereignty</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Voice notes, cloning, transcription and video — on infra you own.
          </p>
        </div>

        <StatusBadges />

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/notes"
            className="rounded-2xl border border-line bg-surface p-4 shadow-sm active:bg-surface-muted"
          >
            <div className="mb-2 text-2xl">🎙️</div>
            <div className="text-sm font-semibold text-ink">Voice notes</div>
            <div className="mt-0.5 text-xs text-ink-muted">Record & transcribe</div>
          </Link>
          <Link
            href="/voice"
            className="rounded-2xl border border-line bg-surface p-4 shadow-sm active:bg-surface-muted"
          >
            <div className="mb-2 text-2xl">🗣️</div>
            <div className="text-sm font-semibold text-ink">Voice cloning</div>
            <div className="mt-0.5 text-xs text-ink-muted">Text-to-speech</div>
          </Link>
          <Link
            href="/calls"
            className="rounded-2xl border border-line bg-surface p-4 shadow-sm active:bg-surface-muted"
          >
            <div className="mb-2 text-2xl">📹</div>
            <div className="text-sm font-semibold text-ink">Video calls</div>
            <div className="mt-0.5 text-xs text-ink-muted">WebRTC rooms</div>
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 text-xs leading-relaxed text-ink-muted">
          <div className="mb-1 font-semibold text-ink">Setup</div>
          Everything runs locally or self-hosted. Configure <code className="rounded bg-black/5 px-1">.env.local</code> for
          the VoiceStudio backend (transcription), a TTS provider (voice cloning), and LiveKit (video).
          See <code className="rounded bg-black/5 px-1">README.md</code>.
        </div>
      </div>
    </Shell>
  );
}
