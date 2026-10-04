/** Heading on the left (stacked on mobile), content on the right. */
export default function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 py-8 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-[15px] text-slate-700 marker:text-slate-300">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-[15px] text-slate-700">
      <span className="text-slate-500">{label}: </span>
      {children}
    </p>
  );
}
