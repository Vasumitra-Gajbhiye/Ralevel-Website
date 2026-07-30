import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type BrowsePageHeroProps = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
};

export default function BrowsePageHero({
  title,
  subtitle,
  searchPlaceholder,
}: BrowsePageHeroProps) {
  return (
    <header className="flex flex-col items-center text-center space-y-4">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="text-xl text-slate-700">{subtitle}</p>

      <div className="relative mt-2 w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          readOnly
          aria-label={`Search ${title.toLowerCase()}`}
          placeholder={searchPlaceholder}
          className="h-12 cursor-default rounded-full border-slate-200 bg-white pl-11 pr-4 text-base shadow-sm"
        />
      </div>
    </header>
  );
}
