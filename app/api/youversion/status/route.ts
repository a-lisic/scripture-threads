import { NextResponse } from "next/server";
import { getYouVersionIntegrationStatus } from "@/lib/youversion";

export async function GET() {
  return NextResponse.json(getYouVersionIntegrationStatus());
}
