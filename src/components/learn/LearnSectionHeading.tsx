type LearnSectionHeadingProps = {
  title: string;
  description?: string;
  id?: string;
};

export default function LearnSectionHeading({
  title,
  description,
  id,
}: LearnSectionHeadingProps) {
  return (
    <div className="space-y-2">
      <h2 id={id} className="text-2xl font-semibold text-slate-900">
        {title}
      </h2>
      {description && (
        <p className="text-slate-600 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
