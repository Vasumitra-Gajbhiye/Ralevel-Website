import { NextResponse } from "next/server";

export type ChangeRequestErrorCode =
  | "not_found"
  | "no_changes"
  | "open_request_exists"
  | "draft_locked"
  | "wrong_status"
  | "stale"
  | "approving"
  | "forbidden";

/** An expected failure with a status code and a message safe to show. */
export class ChangeRequestError extends Error {
  constructor(
    readonly code: ChangeRequestErrorCode,
    readonly status: number,
    message: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ChangeRequestError";
  }
}

export function changeRequestErrorResponse(error: unknown): Response {
  if (error instanceof ChangeRequestError) {
    return NextResponse.json(
      { error: error.message, code: error.code, ...error.extra },
      { status: error.status },
    );
  }
  console.error("Resource change request error:", error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
