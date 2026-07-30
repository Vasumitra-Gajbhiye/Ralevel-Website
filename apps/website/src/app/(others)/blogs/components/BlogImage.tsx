import Image from "next/image";

export default function BlogImage({
  src,
  alt,
  caption,
  width = 1200,
  height = 800,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  if (!src) {
    return (
      <div className="my-8 border border-dashed rounded-xl p-6 text-center text-sm text-gray-400">
        Image preview will appear here once a URL is added
      </div>
    );
  }

  const isExternal = /^https?:\/\//i.test(src);
  const isInternal = src.startsWith("/");

  return (
    <figure className="my-8">
      {isExternal || !isInternal ? (
        <img src={src} alt={alt} className="w-full rounded-xl" />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="rounded-xl shadow-sm object-cover w-full"
        />
      )}

      {caption && (
        <figcaption className="text-center text-sm text-gray-500 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
