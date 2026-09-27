"use client";

import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  createLocalTracks,
  type LocalTrack,
  type LocalVideoTrack,
  type RemoteParticipant,
} from "livekit-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

let identityCounter = 0;

export function CallsScreen() {
  const [roomName, setRoomName] = useState("");
  const [identity, setIdentity] = useState("");
  const [joined, setJoined] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remoteKeys, setRemoteKeys] = useState<string[]>([]);

  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const localTracksRef = useRef<LocalTrack[]>([]);

  function attachRemote(participant: RemoteParticipant) {
    participant.on("trackSubscribed", (track) => {
      if (track.kind !== "video") return;
      const el = remoteRefs.current.get(participant.identity) ?? document.createElement("video");
      track.attach(el);
      el.autoplay = true;
      el.playsInline = true;
      remoteRefs.current.set(participant.identity, el);
      setRemoteKeys(Array.from(remoteRefs.current.keys()));
    });
    participant.on("trackUnsubscribed", (track) => {
      if (track.kind !== "video") return;
      track.detach();
    });
  }

  async function join() {
    setError(null);
    setPending(true);
    try {
      const fallbackIdentity = `guest-${++identityCounter}`;
      const res = await fetch("/api/video/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomName, identity: identity || fallbackIdentity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not join.");

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.ParticipantConnected, (p) => attachRemote(p));
      room.on(RoomEvent.Disconnected, () => {
        setJoined(false);
        setRemoteKeys([]);
      });

      await room.connect(data.url, data.token);

      const tracks = await createLocalTracks({ audio: true, video: true });
      localTracksRef.current = tracks;
      for (const t of tracks) await room.localParticipant.publishTrack(t);

      const cam = tracks.find((t) => t.kind === "video") as LocalVideoTrack | undefined;
      if (cam && localVideoRef.current) {
        cam.attach(localVideoRef.current);
      }

      for (const p of room.remoteParticipants.values()) attachRemote(p);

      setJoined(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join the call.");
    } finally {
      setPending(false);
    }
  }

  function leave() {
    const room = roomRef.current;
    roomRef.current = null;
    if (room) void room.disconnect();
    localTracksRef.current.forEach((t) => t.stop());
    localTracksRef.current = [];
    setJoined(false);
    setRemoteKeys([]);
  }

  useEffect(() => {
    const room = roomRef.current;
    const tracks = localTracksRef.current;
    return () => {
      if (room) void room.disconnect();
      tracks.forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-bold text-ink">Video calls</h1>

      {!joined ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Room name</label>
            <Input placeholder="e.g. team-standup" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Your name <span className="text-ink-subtle">optional</span>
            </label>
            <Input placeholder="e.g. Ada" value={identity} onChange={(e) => setIdentity(e.target.value)} />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button fullWidth size="lg" disabled={pending || roomName.trim().length === 0} onClick={join}>
            {pending ? <Spinner className="size-4" /> : "Join call"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-black">
            <video ref={localVideoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
          </div>
          {remoteKeys.map((key) => (
            <div key={key} className="overflow-hidden rounded-2xl border border-line bg-black">
              <video
                ref={(el) => {
                  if (el) remoteRefs.current.set(key, el);
                }}
                autoPlay
                playsInline
                className="aspect-video w-full object-cover"
              />
            </div>
          ))}
          <Button variant="danger" fullWidth size="lg" onClick={leave}>
            Leave
          </Button>
        </div>
      )}
    </div>
  );
}
