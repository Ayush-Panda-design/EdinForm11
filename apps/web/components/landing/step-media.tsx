"use client";

import { LandingImage } from "~/components/landing/landing-image";

type StepMediaProps = {
  image: string;
  imageAlt: string;
};

export function StepMedia({ image, imageAlt }: StepMediaProps) {
  return (
    <div className="mkt-card-photo mkt-photo-zoom">
      <LandingImage
        src={image}
        alt={imageAlt}
        fill
        className="mkt-photo-cover"
        sizes="(max-width: 768px) 100vw, 25vw"
      />
    </div>
  );
}
