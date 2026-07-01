import { NextResponse } from "next/server";
import { readAiConnectionStatus } from "@/lib/server/aiConnectionStore";
import { ApiError, requireUser } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    return NextResponse.json(await readAiConnectionStatus(user.uid));
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to read AI status." }, { status: 500 });
  }
}
