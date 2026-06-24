"use client";

import React, { ReactNode } from "react";

type Props = React.HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
};

// Recursively extract text for slug/id
function textFrom(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFrom).join("");
  if (React.isValidElement(node)) return textFrom(node.props?.children);
  return "";
}

export default function BlogHeading({ children, className, ...rest }: Props) {
  const raw = textFrom(children);
  const id = raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  return (
    <h2
      id={id}
      className={`numbered-h2 text-[1.35rem] md:text-[1.55rem] font-semibold text-sky-900 tracking-tight leading-snug mt-16 mb-6 ${
        className ?? ""
      }`}
      {...rest}
    >
      {children}

      {/* Scoped CSS counter for the number prefix */}
      <style jsx>{`
        .numbered-h2::before {
          color: #024a70; /* sky-900 */
          font-weight: 800;
          margin-right: 0.5rem;
        }
      `}</style>
    </h2>
  );
}
