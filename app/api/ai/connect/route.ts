import { NextResponse } from "next/server";
import { isAiProvider, verifyProviderKey } from "@/lib/server/aiProviders";
import { saveAiConnection } from "@/lib/server/aiConnectionStore";
import { ApiError, requireUser } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const provider = body?.provider;
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

    if (!isAiProvider(provider)) return NextResponse.json({ error: "Choose OpenAI or Anthropic." }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "Paste an API key first." }, { status: 400 });

    const check = await verifyProviderKey(provider, apiKey);
    if (!check.ok) return NextResponse.json({ error: check.message }, { status: 400 });

    return NextResponse.json(await saveAiConnection(user.uid, provider, apiKey));
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to connect AI provider." }, { status: 500 });
  }
}
