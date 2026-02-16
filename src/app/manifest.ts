import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inchecken",
    short_name: "Inchecken",
    description: "Dagelijkse check-in: gedachten, emoties, lijf, energie, gedrag",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4f6ff",
    theme_color: "#6f63ff",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
