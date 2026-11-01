import { describe, expect, it } from "vitest";
import {
  APPROVAL_LEASE_MS,
  canApprove,
  canPublishDirectly,
  canReject,
  canRequestChanges,
  canRestore,
  canResubmit,
  canSubmit,
  canWithdraw,
  draftEditMode,
  type ChangeRequestState,
  type ChangeRequestViewer,
} from "../rules";

const NOW = Date.parse("2026-11-02T10:00:00Z");

const author: ChangeRequestViewer = { userId: "a", canPublish: false, isAdmin: false };
const otherStaff: ChangeRequestViewer = { userId: "b", canPublish: false, isAdmin: false };
const head: ChangeRequestViewer = { userId: "h", canPublish: true, isAdmin: false };
const admin: ChangeRequestViewer = { userId: "x", canPublish: true, isAdmin: true };

const req = (
  status: ChangeRequestState["status"],
  extra: Partial<ChangeRequestState> = {},
): ChangeRequestState => ({ status, authorUserId: "a", approvingAt: null, ...extra });

const leased = { approvingAt: new Date(NOW - 1_000) };
const expiredLease = { approvingAt: new Date(NOW - APPROVAL_LEASE_MS - 1) };

describe("draftEditMode", () => {
  it("is free for everyone when nothing is open", () => {
    for (const viewer of [author, otherStaff, head]) {
      expect(draftEditMode(null, viewer, NOW)).toBe("free");
    }
  });

  it("locks staff while in review and lets reviewers edit", () => {
    const r = req("in_review");
    expect(draftEditMode(r, author, NOW)).toBe("locked");
    expect(draftEditMode(r, otherStaff, NOW)).toBe("locked");
    expect(draftEditMode(r, head, NOW)).toBe("reviewer");
  });

  it("lets only the author (and reviewers) edit after changes are requested", () => {
    const r = req("changes_requested");
    expect(draftEditMode(r, author, NOW)).toBe("author");
    expect(draftEditMode(r, otherStaff, NOW)).toBe("locked");
    expect(draftEditMode(r, head, NOW)).toBe("reviewer");
  });

  it("locks everyone while an approval is publishing, until the lease expires", () => {
    expect(draftEditMode(req("in_review", leased), head, NOW)).toBe("locked");
    expect(draftEditMode(req("in_review", expiredLease), head, NOW)).toBe("reviewer");
  });

  it("treats closed requests as nothing open", () => {
    for (const status of ["approved", "rejected", "withdrawn"] as const) {
      expect(draftEditMode(req(status), otherStaff, NOW)).toBe("free");
    }
  });
});

describe("submitting and publishing", () => {
  it("staff submit, publishers publish, and neither while a request is open", () => {
    expect(canSubmit(null, author)).toBe(true);
    expect(canSubmit(null, head)).toBe(false);
    expect(canPublishDirectly(null, head)).toBe(true);
    expect(canPublishDirectly(null, author)).toBe(false);
    expect(canSubmit(req("in_review"), otherStaff)).toBe(false);
    expect(canPublishDirectly(req("changes_requested"), head)).toBe(false);
  });

  it("only the author resubmits, and only after changes are requested", () => {
    expect(canResubmit(req("changes_requested"), author)).toBe(true);
    expect(canResubmit(req("changes_requested"), otherStaff)).toBe(false);
    expect(canResubmit(req("changes_requested"), head)).toBe(false);
    expect(canResubmit(req("in_review"), author)).toBe(false);
  });
});

describe("reviewing", () => {
  it("lets publishers approve or request changes while in review", () => {
    expect(canApprove(req("in_review"), head, NOW)).toBe(true);
    expect(canRequestChanges(req("in_review"), head, NOW)).toBe(true);
    expect(canApprove(req("changes_requested"), head, NOW)).toBe(false);
    expect(canRequestChanges(req("changes_requested"), head, NOW)).toBe(false);
    expect(canApprove(req("in_review"), otherStaff, NOW)).toBe(false);
  });

  it("doesn't let a head review their own request, but admins can", () => {
    const own = req("in_review", { authorUserId: "h" });
    expect(canApprove(own, head, NOW)).toBe(false);
    expect(canReject(own, head, NOW)).toBe(false);
    expect(canApprove(req("in_review", { authorUserId: "x" }), admin, NOW)).toBe(true);
  });

  it("allows rejecting any open request, not closed ones", () => {
    expect(canReject(req("in_review"), head, NOW)).toBe(true);
    expect(canReject(req("changes_requested"), head, NOW)).toBe(true);
    expect(canReject(req("approved"), head, NOW)).toBe(false);
  });

  it("blocks every review action during an approval", () => {
    const r = req("in_review", leased);
    expect(canApprove(r, head, NOW)).toBe(false);
    expect(canRequestChanges(r, head, NOW)).toBe(false);
    expect(canReject(r, head, NOW)).toBe(false);
    expect(canWithdraw(r, author, NOW)).toBe(false);
  });
});

describe("withdrawing and restoring", () => {
  it("only the author withdraws an open request", () => {
    expect(canWithdraw(req("in_review"), author, NOW)).toBe(true);
    expect(canWithdraw(req("changes_requested"), author, NOW)).toBe(true);
    expect(canWithdraw(req("in_review"), head, NOW)).toBe(false);
    expect(canWithdraw(req("approved"), author, NOW)).toBe(false);
  });

  it("restores rejected or withdrawn requests for the author or a publisher", () => {
    expect(canRestore(req("rejected"), author, false)).toBe(true);
    expect(canRestore(req("withdrawn"), head, false)).toBe(true);
    expect(canRestore(req("rejected"), otherStaff, false)).toBe(false);
    expect(canRestore(req("approved"), author, false)).toBe(false);
    expect(canRestore(req("rejected"), author, true)).toBe(false);
  });
});
