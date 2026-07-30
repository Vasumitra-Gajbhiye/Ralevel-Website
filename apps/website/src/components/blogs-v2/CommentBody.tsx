import { parseCommentBody } from "@/lib/sanitizeCommentBody";
import { Fragment } from "react";

type CommentBodyProps = {
  body: string;
  className?: string;
};

export default function CommentBody({ body, className }: CommentBodyProps) {
  const segments = parseCommentBody(body);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === "bold") {
          return <strong key={i}>{seg.value}</strong>;
        }
        if (seg.type === "italic") {
          return <em key={i}>{seg.value}</em>;
        }
        return <Fragment key={i}>{seg.value}</Fragment>;
      })}
    </span>
  );
}
