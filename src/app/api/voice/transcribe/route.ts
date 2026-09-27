import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/voice/transcribe";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await transcribeAudio(buf, {
      filename: file instanceof File ? file.name : "recording.webm",
      mimeType: file.type || "audio/webm",
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
