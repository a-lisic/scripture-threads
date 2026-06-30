export type YouVersionIntegrationStatus = {
  ready: boolean;
  needed: string[];
};

export function getYouVersionIntegrationStatus(): YouVersionIntegrationStatus {
  const needed: string[] = [];
  if (!process.env.YOUVERSION_API_KEY) needed.push("YOUVERSION_API_KEY");

  return {
    ready: needed.length === 0,
    needed
  };
}

export async function fetchYouVersionPassage() {
  throw new Error(
    "YouVersion integration is intentionally server-side only. Add YOUVERSION_API_KEY, choose REST/SDK after app registration, then implement this server route."
  );
}
