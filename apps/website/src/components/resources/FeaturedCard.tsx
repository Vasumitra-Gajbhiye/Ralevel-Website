import { cldImage } from "@/lib/cloudinary";
import type { FeaturedCard as FeaturedCardData } from "@/types/resources2";
import Image from "next/image";
import Link from "next/link";

export default function FeaturedCard({ card }: { card: FeaturedCardData }) {
  const external = !card.href.startsWith("/");

  return (
    <li className="w-72 shrink-0 snap-start sm:w-80">
      <Link
        href={card.href}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {card.image && (
            <Image
              src={cldImage(card.image)}
              alt=""
              fill
              sizes="320px"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          )}
          {card.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
              {card.badge}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="font-semibold leading-snug text-slate-900">
            {card.title}
          </h3>
          {card.description && (
            <p className="line-clamp-2 text-sm text-slate-500">
              {card.description}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
