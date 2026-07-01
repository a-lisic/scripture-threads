import { NextResponse } from "next/server";
import { listAvailableBibles } from "@/lib/youversion";
import { ApiError, requireUser } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";

const PREFERRED_ORDER = ["CSB", "NLT", "BSB", "NASB2020", "NIV", "AMP", "NASB1995", "ASV"];

function abbreviationFor(bible: {
  abbreviation: string;
  localized_abbreviation?: string;
}) {
  return bible.localized_abbreviation || bible.abbreviation;
}

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const bibles = await listAvailableBibles("en");
    const translations = bibles
      .map((bible) => {
        const abbreviation = abbreviationFor(bible);
        const title = bible.localized_title || bible.title;
        return {
          id: bible.id,
          value: abbreviation,
          abbreviation,
          title,
          label: `${abbreviation} - ${title}`
        };
      })
      .sort((a, b) => {
        const aIndex = PREFERRED_ORDER.indexOf(a.abbreviation);
        const bIndex = PREFERRED_ORDER.indexOf(b.abbreviation);
        if (aIndex !== -1 || bIndex !== -1) {
          return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        }
        return a.abbreviation.localeCompare(b.abbreviation);
      });

    return NextResponse.json({ translations });
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load YouVersion translations." },
      { status: 500 }
    );
  }
}
