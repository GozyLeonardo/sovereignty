import "server-only";
import { AccessToken } from "livekit-server-sdk";
import { env } from "@/lib/env";

/**
 * LiveKit WebRTC tokens. The server signs a short-lived JWT granting a user
 * permission to join a specific room. Never expose the API secret to the
 * browser — only the token endpoint talks to LiveKit.
 */

export function liveKitConfigured(): boolean {
  return Boolean(env.LIVEKIT_URL && env.LIVEKIT_API_KEY && env.LIVEKIT_API_SECRET);
}

export async function generateLiveKitToken(opts: {
  room: string;
  identity: string;
  name?: string;
}): Promise<{ token: string; url: string }> {
  if (!liveKitConfigured()) {
    throw new Error("LiveKit is not configured.");
  }

  const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity: opts.identity,
    name: opts.name ?? opts.identity,
    ttl: "2h",
  });
  at.addGrant({ roomJoin: true, room: opts.room, canPublish: true, canSubscribe: true });

  return { token: await at.toJwt(), url: env.LIVEKIT_URL };
}
