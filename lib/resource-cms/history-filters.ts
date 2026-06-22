import type {
  ResourceCmsRevisionAction,
  ResourceCmsRevisionKind,
  ResourceCmsSnapshotScope,
} from "@/types/resources2";

export type ResourceCMSHistoryFilters = {
  slug?: string;
  kind?: ResourceCmsRevisionKind;
  action?: ResourceCmsRevisionAction;
  actorUserId?: string;
  snapshotScope?: ResourceCmsSnapshotScope;
  from?: string;
  to?: string;
};

export function parseResourceCMSHistoryFilters(
  input: URLSearchParams | { get: (key: string) => string | null }
): ResourceCMSHistoryFilters {
  const slug = input.get("slug") ?? undefined;
  const kind = input.get("kind");
  const action = input.get("action");
  const actorUserId = input.get("actor") ?? undefined;
  const snapshotScope = input.get("snapshotScope");
  const from = input.get("from") ?? undefined;
  const to = input.get("to") ?? undefined;

  return {
    slug: slug || undefined,
    kind: kind === "edit" || kind === "backup" ? kind : undefined,
    action:
      action === "save_draft" || action === "publish" || action === "restore"
        ? action
        : undefined,
    actorUserId: actorUserId || undefined,
    snapshotScope:
      snapshotScope === "draft" || snapshotScope === "live"
        ? snapshotScope
        : undefined,
    from: isValidDateParam(from) ? from : undefined,
    to: isValidDateParam(to) ? to : undefined,
  };
}

function isValidDateParam(value: string | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function hasActiveHistoryFilters(
  filters: ResourceCMSHistoryFilters
): boolean {
  return Boolean(
    filters.slug ||
      filters.kind ||
      filters.action ||
      filters.actorUserId ||
      filters.snapshotScope ||
      filters.from ||
      filters.to
  );
}
