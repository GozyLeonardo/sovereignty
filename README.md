# Sovereignty

A self-hosted voice platform: **voice notes, transcription, voice cloning /
text-to-speech, and WebRTC video calls** — running on infrastructure you own.

## Stack

| Concern | Technology |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| Transcription (STT) | [VoiceStudio](https://github.com/debpalash/VoiceStudio) local backend (OpenAI-compatible API on `:3900`) |
| Voice cloning / TTS | Provider abstraction — ElevenLabs, OpenAI-compatible, or VoiceStudio |
| Video calls | [LiveKit](https://livekit.io) (self-hosted WebRTC SFU) |

## Layout

```
src/
  app/
    page.tsx               home + status
    notes/page.tsx         voice notes (record / play / transcribe)
    voice/page.tsx         TTS / voice cloning
    calls/page.tsx         video call rooms
    api/
      voice/transcribe     POST audio -> text (proxies VoiceStudio)
      voice/tts            POST text -> audio (provider abstraction)
      video/token          POST -> LiveKit join token
      status               GET -> which services are configured
  lib/
    voice/transcribe.ts    VoiceStudio STT client
    voice/tts.ts           TTS provider abstraction
    video/livekit.ts       token signing (livekit-server-sdk)
    env.ts                 typed env
```

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

### 3. Start the self-hosted services (optional but needed for full features)

```bash
# generate a random admin key and write it to .env (and .env.local)
export OMNIVOICE_API_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
echo "OMNIVOICE_API_KEY=$OMNIVOICE_API_KEY" >> .env

# edit livekit.yaml to set a random secret, and match it in .env.local

docker compose up -d
```

- **VoiceStudio** UI: http://localhost:3900 (first run downloads ~2.4 GB of models).
- **LiveKit** listens on `:7880` (RTC on `:7881`/`:7882` + UDP `50000-50100`).

### 4. Run the app

```bash
pnpm dev
```

Open http://localhost:3000.

## Feature notes

- **Voice notes** record in the browser (MediaRecorder), persist locally, and
  transcribe via the VoiceStudio backend (`POST /v1/audio/transcriptions`).
- **Voice cloning** is provider-driven: clone a voice in VoiceStudio's own UI
  (or ElevenLabs), then generate speech from this app via `TTS_PROVIDER`.
- **Video calls** use LiveKit rooms. Set `LIVEKIT_URL` / `LIVEKIT_API_KEY` /
  `LIVEKIT_API_SECRET` to match `livekit.yaml`. The server signs short-lived
  tokens; secrets never reach the browser.

## Security notes

- VoiceStudio is published on loopback (`127.0.0.1:3900`) only — keep it that
  way, or put it behind Tailscale/ZeroTier; do not expose it to the internet.
- Use long, random secrets for `OMNIVOICE_API_KEY`, `LIVEKIT_API_SECRET`, and
  any TTS provider key.
- Voice cloning raises consent questions: only clone voices you have permission
  to use.
