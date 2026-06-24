"use client";

import {
  arrow,
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { useRef } from "react";

export default function ErrorPopover({
  reference,
  message,
}: {
  reference: HTMLElement | null;
  message: string;
}) {
  const arrowRef = useRef(null);

  const { x, y, strategy, refs, middlewareData } = useFloating({
    elements: {
      reference,
    },
    middleware: [offset(8), flip(), shift(), arrow({ element: arrowRef })],
  });

  if (!reference) return null;

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
        }}
        className="z-50 rounded-md bg-red-600 px-3 py-2 text-sm text-white shadow-lg"
      >
        {message}
        <div
          ref={arrowRef}
          className="absolute h-2 w-2 bg-red-600 rotate-45"
          style={{
            left: middlewareData.arrow?.x,
            top: middlewareData.arrow?.y,
          }}
        />
      </div>
    </FloatingPortal>
  );
}
