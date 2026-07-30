export type PlaygroundDraft = {
  mdx: string;
  metadata: {
    title: string;
    author: string;
    date: string;
    image?: string;
  };
  version: number;
};

const KEY = "playground-draft";

export function saveDraft(draft: PlaygroundDraft) {
  localStorage.setItem(KEY, JSON.stringify(draft));
}

export function loadDraft(): PlaygroundDraft | null {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
