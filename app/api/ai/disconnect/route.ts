import { NextResponse } from "next/server";
import { deleteAiConnection } from "@/lib/server/aiConnectionStore";
import { ApiError, requireUser } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    await deleteAiConnection(user.uid);
    return NextResponse.json({ connected: false });
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to disconnect AI provider." }, { status: 500 });
  }
}
