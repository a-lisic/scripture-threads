import { NextResponse } from "next/server";
import { getDecryptedAiConnection } from "@/lib/server/aiConnectionStore";
import { generateStudyWithProvider } from "@/lib/server/aiProviders";
import { ApiError, requireUser } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const passage = typeof body?.passage === "string" ? body.passage.trim() : "";
    const translation = typeof body?.translation === "string" ? body.translation.trim() : "CSB";
    const mode = typeof body?.mode === "string" ? body.mode.trim() : "Guided Deep Study";

    if (!passage) return NextResponse.json({ error: "Enter a passage first." }, { status: 400 });
    if (passage.length > 120) return NextResponse.json({ error: "Passage is too long for one generation request." }, { status: 400 });

    const connection = await getDecryptedAiConnection(user.uid);
    if (!connection) return NextResponse.json({ error: "Connect an AI provider before live generation." }, { status: 409 });

    const study = await generateStudyWithProvider(connection.provider, connection.apiKey, { passage, translation, mode });
    return NextResponse.json({ study, provider: connection.provider });
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Study generation failed." }, { status: 500 });
  }
}
