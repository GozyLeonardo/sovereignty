"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";

interface Note {
  id: string;
  createdAt: number;
  duration: number;
  audio: string; // data URL
  transcript?: string;
}

const STORAGE_KEY = "sovereignty.notes";

function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persistNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // storage full — drop silently for the demo
  }
}

export function NotesScreen() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [transcribing, setTranscribing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Hydrate persisted notes after mount (localStorage is client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(loadNotes());
  }, []);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const note: Note = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            duration: Math.round(elapsed),
            audio: String(reader.result),
          };
          const next = [note, ...loadNotes()];
          setNotes(next);
          persistNotes(next);
          stream.getTracks().forEach((t) => t.stop());
        };
        reader.readAsDataURL(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setElapsed(0);
      setRecording(true);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      setError("Microphone access denied.");
    }
  }

  function stop() {
    stopTimer();
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function transcribe(note: Note) {
    setError(null);
    setTranscribing(note.id);
    try {
      const blob = await (await fetch(note.audio)).blob();
      const form = new FormData();
      form.append("file", blob, "note.webm");
      const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Transcription failed.");
      const next = notes.map((n) => (n.id === note.id ? { ...n, transcript: data.text } : n));
      setNotes(next);
      persistNotes(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed.");
    } finally {
      setTranscribing(null);
    }
  }

  function remove(id: string) {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    persistNotes(next);
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-bold text-ink">Voice notes</h1>

      <Card className="p-6 text-center">
        {recording ? (
          <div>
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="size-3 animate-pulse rounded-full bg-red-500" />
              <span className="tabular-nums text-2xl font-bold text-ink">
                {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
              </span>
            </div>
            <Button variant="danger" size="lg" fullWidth onClick={stop}>
              Stop & save
            </Button>
          </div>
        ) : (
          <div>
            <Button size="lg" fullWidth onClick={start}>
              Start recording
            </Button>
          </div>
        )}
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      {notes.length === 0 ? (
        <Card>
          <EmptyState icon="🎙️" title="No notes yet." description="Record your first voice note." />
        </Card>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Card key={note.id} className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-subtle">
                  {new Date(note.createdAt).toLocaleString()} · {note.duration}s
                </span>
                <button onClick={() => remove(note.id)} className="text-xs text-ink-subtle">
                  Delete
                </button>
              </div>
              <audio controls src={note.audio} className="mt-2 h-9 w-full" />
              {note.transcript ? (
                <p className="mt-2 rounded-lg bg-surface-muted p-2 text-sm text-ink">{note.transcript}</p>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  disabled={transcribing === note.id}
                  onClick={() => transcribe(note)}
                >
                  {transcribing === note.id ? <Spinner className="size-3" /> : "Transcribe"}
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
