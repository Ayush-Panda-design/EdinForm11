import { LANDING_IMAGES } from "~/components/landing/landing-images";

/** Form-workflow clips from Pexels (royalty-free) */

function pexels(id: number, fps: 25 | 30 = 25) {
  return `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_${fps}fps.mp4`;
}

export type LandingVideoClip = {
  src: string;
  poster: string;
  label: string;
};

export const LANDING_VIDEOS = {
  /** Team reviewing data together */
  showcase: {
    src: pexels(3255275),
    poster: LANDING_IMAGES.showcase,
    label: "Reviewing form responses",
  },
  /** Team collaborating around a laptop — product walkthrough hero */
  product: {
    src: pexels(8519335, 30),
    poster: LANDING_IMAGES.showcase,
    label: "Team shipping a form workflow",
  },
  /** Coworkers building together — alternate / fallback */
  collaborate: {
    src: pexels(6877953),
    poster: LANDING_IMAGES.showcase,
    label: "Collaborative form building",
  },
} as const satisfies Record<string, LandingVideoClip>;
