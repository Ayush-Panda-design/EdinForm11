/** Form-builder themed imagery (Unsplash) — used in uniform card slots only */

export function unsplash(path: string, width = 800) {
  return `https://images.unsplash.com/${path}?auto=format&fit=crop&w=${width}&q=80`;
}

export const LANDING_IMAGES = {
  /** How-it-works — 4 matching 16:10 card headers */
  steps: {
    draft: unsplash("photo-1516321318423-f06f85e504b3", 640),
    logic: unsplash("photo-1553877522-43269d4ea984", 640),
    publish: unsplash("photo-1556656793-08538906a9f8", 640),
    analytics: unsplash("photo-1551288049-bebda4e38f71", 640),
  },
  /** Showcase split + video poster */
  showcase: unsplash("photo-1552664730-d307ca884978", 1200),
  /** Final CTA background */
  cta: unsplash("photo-1498050108023-c5249f4df085", 1600),
  /** Testimonial avatars */
  testimonials: {
    isla: unsplash("photo-1573496359142-b8d87734a5a2", 128),
    marcus: unsplash("photo-1472099645785-5658abf4ff4e", 128),
    tom: unsplash("photo-1507003211169-0a1dd7228f2d", 128),
    priya: unsplash("photo-1580489944761-15a19d654956", 128),
    sara: unsplash("photo-1438761681033-6461ffad8d80", 128),
    james: unsplash("photo-1500648767791-00dcc994a43e", 128),
  },
} as const;
