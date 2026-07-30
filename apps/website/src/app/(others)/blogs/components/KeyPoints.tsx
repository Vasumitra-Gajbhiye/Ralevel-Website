import React, { ReactNode, isValidElement } from "react";

const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

/* ---- Types first (fixes circular reference) ---- */
type Color = "emerald" | "sky" | "rose" | "amber" | "violet";
type Variant = "check" | "bullet" | "number" | "star" | "minimal";

/* ---- Now tint uses Color, not the other way around ---- */
const tint: Record<
  Color,
  { border: string; bg: string; text: string; icon: string }
> = {
  emerald: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    icon: "text-emerald-500",
  },
  sky: {
    border: "border-sky-200",
    bg: "bg-sky-50",
    text: "text-sky-900",
    icon: "text-sky-500",
  },
  rose: {
    border: "border-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-900",
    icon: "text-rose-500",
  },
  amber: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-900",
    icon: "text-amber-500",
  },
  violet: {
    border: "border-violet-200",
    bg: "bg-violet-50",
    text: "text-violet-900",
    icon: "text-violet-500",
  },
};

type Props = {
  items?: string[];
  children?: ReactNode;
  color?: Color;
  variant?: Variant;
  title?: string;
};

/* ---- Helpers ---- */
const getText = (node: ReactNode): string => {
  if (!node) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (isValidElement(node)) return getText(node.props?.children);
  return "";
};

function extractItems(children: ReactNode): string[] {
  if (!children) return [];

  const first = Array.isArray(children) ? children[0] : children;

  if (isValidElement(first) && (first.type === "ul" || first.type === "ol")) {
    const el = first as React.ReactElement<{ children?: ReactNode }>;
    const items = React.Children.toArray(el.props.children);
    return items.map((n) => getText(n).trim()).filter(Boolean);
  }

  const text = getText(children);
  return text
    .split("\n")
    .map((l) => l.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

/* ---- Icons ---- */
function Icon({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  if (variant === "star")
    return <span className={cn("text-xl", className)}>★</span>;
  if (variant === "check")
    return <span className={cn("text-xl", className)}>✓</span>;
  return null;
}

/* ---- Component ---- */
export default function KeyPoints({
  items,
  children,
  color = "emerald",
  variant = "check",
  title,
}: Props) {
  const computed = items && items.length ? items : extractItems(children);
  if (computed.length === 0) return null;

  const palette = tint[color];

  // Minimal ignores bg + border entirely
  const containerClasses =
    variant === "minimal"
      ? "my-6 ml-1 space-y-3 text-[15px] text-slate-800"
      : cn(
          "my-6 rounded-2xl border p-5 md:p-6 shadow-sm",
          palette.bg,
          palette.border
        );

  return (
    <div className={containerClasses}>
      {title && (
        <div className={cn("mb-3 text-sm font-semibold", palette.text)}>
          {title}
        </div>
      )}

      {/* minimal variant */}
      {variant === "minimal" && (
        <ul className="space-y-2 marker:text-slate-500 list-disc ml-4">
          {computed.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      {(variant === "check" || variant === "star") && (
        <ul
          className={cn("space-y-3 text-[15px] leading-relaxed", palette.text)}
        >
          {computed.map((line, i) => (
            <li key={i} className="flex gap-3">
              <Icon variant={variant} className={palette.icon} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      {variant === "bullet" && (
        <ul
          className={cn(
            "ml-1 space-y-3 text-[15px] leading-relaxed",
            palette.text
          )}
        >
          {computed.map((line, i) => (
            <li key={i} className="flex gap-3">
              <span
                className={cn(
                  "mt-[6px] h-2 w-2 rounded-full",
                  palette.icon,
                  "bg-current"
                )}
              />
              <span className="flex-1">{line}</span>
            </li>
          ))}
        </ul>
      )}

      {variant === "number" && (
        <ol
          className={cn(
            "ml-1 space-y-3 text-[15px] leading-relaxed",
            palette.text
          )}
        >
          {computed.map((line, i) => (
            <li key={i} className="flex gap-3">
              <span
                className={cn(
                  "mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 border",
                  palette.icon,
                  palette.border
                )}
              >
                {i + 1}
              </span>
              <span className="flex-1">{line}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
