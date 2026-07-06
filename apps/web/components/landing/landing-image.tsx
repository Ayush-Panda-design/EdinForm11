import Image from "next/image";

type LandingImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function LandingImage({
  src,
  alt,
  className,
  width,
  height,
  fill,
  priority,
  sizes,
}: LandingImageProps) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 500}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
