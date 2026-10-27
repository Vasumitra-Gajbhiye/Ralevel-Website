/** Star rewards and certificate progress. Pure and client-safe. */

export const STAR_CHOICES = [0, 1, 2, 3] as const;
export type StarCount = (typeof STAR_CHOICES)[number];

/** Every this many stars in a department earns a certificate. */
export const STARS_PER_CERTIFICATE = 5;

export const certificatesEarned = (stars: number) => Math.floor(Math.max(0, stars) / STARS_PER_CERTIFICATE);

/** Certificates earned but not yet marked as issued. */
export const certificatesDue = (stars: number, issued: number) => Math.max(0, certificatesEarned(stars) - issued);

/** True when going from `before` to `after` stars passes a certificate milestone. */
export const crossedMilestone = (before: number, after: number) => certificatesEarned(after) > certificatesEarned(before);

/** Stars towards the next certificate, e.g. 7 → 2 (of 5). */
export const starsTowardNext = (stars: number) => Math.max(0, stars) % STARS_PER_CERTIFICATE;

export const starLabel = (stars: number) => `${stars} star${stars === 1 ? "" : "s"}`;
