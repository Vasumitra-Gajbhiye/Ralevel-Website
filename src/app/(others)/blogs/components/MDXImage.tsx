import Image, { ImageProps } from "next/image";

/**
 * MDX -> Next/Image bridge
 * - Accepts whatever <img> MDX gives us
 * - Provides sensible width/height fallbacks (Next/Image requires them unless `fill`)
 * - Optional caption via `caption` attribute in MDX
 *
 * Usage in MDX:
 *   <img src="/blogs/my-post/hero.jpg" alt="Hero" caption="A helpful caption" />
 */
type Props = Partial<ImageProps> & {
  src: string;          // MDX always supplies a string src
  alt?: string;         // defaulted below
  caption?: string;     // optional MDX attribute
};

export default function MDXImage(props: Props) {
  const {
    src,
    alt,
    caption,
    width,
    height,
    sizes,
    style,
    ...rest
  } = props;

  // Provide fallbacks so authors don’t need to specify width/height in MDX.
  const w = typeof width === "number" ? width : 1200;
  const h = typeof height === "number" ? height : 700;

  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt ?? ""}
        width={w}
        height={h}
        sizes={sizes ?? "100vw"}
        // fluid by default
        style={{ width: "100%", height: "auto", ...(style as any) }}
        {...rest}
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}