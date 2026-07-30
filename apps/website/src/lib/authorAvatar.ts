/** Deterministic avatar URL per author name (UI Avatars). */
export function getAuthorAvatarUrl(author: string): string {
  const name = encodeURIComponent(author.trim() || "Author");
  return `https://ui-avatars.com/api/?name=${name}&size=128&background=E5E5E5&color=525252`;
}
