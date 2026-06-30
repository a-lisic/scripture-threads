import { NextResponse } from "next/server";
import { buildMarkdown } from "@/lib/markdown";
import { generateStudy } from "@/lib/study";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    passage?: string;
    translation?: string;
    mode?: string;
  };

  const passage = body.passage?.trim() || "Untitled Passage";
  const translation = body.translation || "CSB";
  const mode = body.mode || "Guided Deep Study";
  const study = generateStudy(passage, translation, mode);

  return NextResponse.json({
    study,
    markdown: buildMarkdown(study),
    sourceStatus: {
      bibleApi: "placeholder",
      commentary: "placeholder",
      aiGeneration: "placeholder"
    }
  });
}
