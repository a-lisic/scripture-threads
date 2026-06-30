import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scripture Threads",
    short_name: "Threads",
    description: "A clean Bible study workspace for tracing Scripture, study notes, and exports.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f6f1",
    theme_color: "#637569",
    icons: [
      {
        src: "/assets/scripture-threads-header.png",
        sizes: "2048x768",
        type: "image/png"
      }
    ]
  };
}
