"use client";

import React, { ReactNode, isValidElement } from "react";

const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

function extractListItems(children: ReactNode): ReactNode[] {
  if (!children) return [];

  const getLiChildren = (element: React.ReactElement) => {
    const liNodes = React.Children.toArray(element.props.children);
    return liNodes
      .map((node) => {
        if (isValidElement(node) && node.props && "children" in node.props) {
          return node.props.children;
        }
        return null;
      })
      .filter(Boolean);
  };

  // Case 1: children is a single <ul> or <ol>
  if (isValidElement(children)) {
    const tag = String(children.type);
    if (tag === "ul" || tag === "ol") {
      return getLiChildren(children);
    }
  }

  // Case 2: children is an array containing a <ul> or <ol>
  if (Array.isArray(children)) {
    const listElement = children.find(
      (c) =>
        isValidElement(c) &&
        (String(c.type) === "ul" || String(c.type) === "ol")
    );

    if (listElement && isValidElement(listElement)) {
      return getLiChildren(listElement);
    }
  }

  // Case 3: Plain text fallback
  const text = String(children);
  return text
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/^[-*]\s*/, "")
        .replace(/^\d+\.\s*/, "")
    )
    .filter(Boolean)
    .map((line, i) => <span key={i}>{line}</span>);
}

type Props = {
  children?: ReactNode;
  title?: string;
  ordered?: boolean;
};

export default function KeyPointsMinimal({
  children,
  title,
  ordered = false,
}: Props) {
  const items = extractListItems(children);
  if (items.length === 0) return null;

  return (
    <div className="my-10">
      {title && (
        <div className="mb-2 text-xl font-semibold text-sky-800">{title}</div>
      )}

      {ordered ? (
        <ol className="flex flex-col gap-2 mt-3 ml-5 list-decimal tracking-wide text-[1.02rem] leading-8 text-slate-700">
          {items.map((node, i) => (
            <li key={i}>{node}</li>
          ))}
        </ol>
      ) : (
        <ul className="ml-5 list-disc tracking-wide text-[1.02rem] leading-8 text-slate-700">
          {items.map((node, i) => (
            <li key={i}>{node}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
