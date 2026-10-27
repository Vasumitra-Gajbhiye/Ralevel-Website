import { describe, expect, it } from "vitest";
import {
  STARS_PER_CERTIFICATE,
  certificatesDue,
  certificatesEarned,
  crossedMilestone,
  starLabel,
  starsTowardNext,
} from "../stars";

describe("stars", () => {
  it("a certificate every five stars", () => {
    expect(STARS_PER_CERTIFICATE).toBe(5);
    expect(certificatesEarned(0)).toBe(0);
    expect(certificatesEarned(4)).toBe(0);
    expect(certificatesEarned(5)).toBe(1);
    expect(certificatesEarned(12)).toBe(2);
    expect(certificatesEarned(-3)).toBe(0);
  });

  it("detects crossing a milestone, not just being past one", () => {
    expect(crossedMilestone(4, 6)).toBe(true);
    expect(crossedMilestone(4, 5)).toBe(true);
    expect(crossedMilestone(5, 7)).toBe(false);
    expect(crossedMilestone(9, 10)).toBe(true);
    expect(crossedMilestone(8, 11)).toBe(true);
    expect(crossedMilestone(0, 3)).toBe(false);
  });

  it("certificates due subtract the ones already issued", () => {
    expect(certificatesDue(7, 0)).toBe(1);
    expect(certificatesDue(7, 1)).toBe(0);
    expect(certificatesDue(11, 1)).toBe(1);
    expect(certificatesDue(3, 2)).toBe(0);
  });

  it("progress toward the next certificate", () => {
    expect(starsTowardNext(0)).toBe(0);
    expect(starsTowardNext(3)).toBe(3);
    expect(starsTowardNext(5)).toBe(0);
    expect(starsTowardNext(7)).toBe(2);
  });

  it("labels", () => {
    expect(starLabel(1)).toBe("1 star");
    expect(starLabel(3)).toBe("3 stars");
  });
});
