type FormLike = {
  sections?: Array<{
    id: string;
    fields?: Array<{
      id: string;
      type?: string;
      label?: string;
    }>;
  }>;
};

type SubmissionLike = {
  submitterEmail?: string | null;
  responses?: Record<string, Record<string, unknown>> | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function looksLikeEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

/**
 * Prefer stored submitterEmail; otherwise pull from email-typed form fields
 * (or any email-shaped value) in the submission responses.
 */
export function resolveSubmitterEmail(
  submission: SubmissionLike,
  form?: FormLike | null,
): string | null {
  const stored = submission.submitterEmail?.trim();
  if (stored && looksLikeEmail(stored)) return stored;

  const responses = submission.responses;
  if (!responses || typeof responses !== "object") return null;

  if (form?.sections?.length) {
    for (const section of form.sections) {
      const sectionResponses = responses[section.id];
      if (!sectionResponses) continue;
      for (const field of section.fields ?? []) {
        if (field.type !== "email") continue;
        const value = sectionResponses[field.id];
        if (looksLikeEmail(value)) return value.trim();
      }
    }
  }

  for (const sectionResponses of Object.values(responses)) {
    if (!sectionResponses || typeof sectionResponses !== "object") continue;
    for (const value of Object.values(sectionResponses)) {
      if (looksLikeEmail(value)) return value.trim();
      if (Array.isArray(value)) {
        for (const item of value) {
          if (looksLikeEmail(item)) return item.trim();
        }
      }
    }
  }

  return null;
}
