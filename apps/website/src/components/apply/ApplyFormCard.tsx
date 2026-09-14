import { getApplyCardIcon, type ApplyFormCardData } from "@/lib/apply-cards";

type ApplyFormCardProps = {
  card: ApplyFormCardData;
  href?: string;
  preview?: boolean;
};

export default function ApplyFormCard({
  card,
  href,
  preview = false,
}: ApplyFormCardProps) {
  const Icon = getApplyCardIcon(card.icon);
  const isOpen = card.status === "open";
  const gradient = card.gradient || "from-slate-500 to-slate-700";

  const cta = (
    <button
      type="button"
      disabled={!isOpen}
      className={`rounded-lg px-6 py-2.5 text-sm transition ${
        isOpen
          ? "bg-white text-black hover:bg-white/90"
          : "cursor-not-allowed bg-white/40 text-black/60"
      }`}
    >
      {card.ctaText}
    </button>
  );

  return (
    <div
      className={`rounded-2xl bg-gradient-to-r ${gradient} p-8 text-white shadow-lg`}
    >
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              {card.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.logo}
                  alt={`${card.title} logo`}
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <Icon size={26} />
              )}
            </div>
            <h2 className="text-xl font-semibold">{card.title}</h2>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isOpen ? "bg-white/25" : "bg-black/20 text-white/80"
            }`}
          >
            {isOpen ? "Open" : "Coming Soon"}
          </span>
        </div>

        <p className="max-w-3xl text-sm text-white/90">{card.description}</p>
      </div>

      {card.steps.length > 0 && (
        <div className="mb-8 space-y-3">
          {card.steps.map((step, i) => (
            <div key={`${i}-${step}`} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25 text-sm font-semibold">
                {i + 1}
              </div>
              <p className="text-sm text-white/95">{step}</p>
            </div>
          ))}
        </div>
      )}

      {preview || !href ? cta : <a href={href}>{cta}</a>}
    </div>
  );
}
