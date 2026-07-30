export const CERTIFICATE_DEFAULT_MESSAGES: Record<string, string> = {
  helper: "FOR HELPING AND GUIDING THE STUDENTS OF THE r/alevel COMMUNITY",
  resource:
    "FOR MAKING ACADEMIC RESOURCES AND HELPING THE STUDENTS OF r/alevel COMMUNITY",
  moderation:
    "FOR MODERATING AND ENSURING SAFETY WITHIN THE r/alevel ACADEMIC COMMUNITY",
  management: "FOR MANAGING AND DIRECTING THE r/alevel ACADEMIC COMMUNITY",
  writer:
    "FOR WRITING INFORMATIVE AND CREATIVE PIECES FOR THE r/alevel ACADEMIC COMMUNITY",
  graphic:
    "FOR ARTISTICALLY DEVELOPING GRAPHIC DESIGN FOR THE r/alevel ACADEMIC COMMUNITY",
  "2024WriterCompFirstPlace":
    "FOR FIRST PLACE IN THE r/alevel 2024 CREATIVE & ESSAY WRITING COMPETITION",
};

/** @deprecated Use CERTIFICATE_DEFAULT_MESSAGES */
export const DEFAULT_MESSAGES = CERTIFICATE_DEFAULT_MESSAGES;

export type CertificateMessageSource = {
  certType?: string;
  hasCustomMessage?: boolean;
  customMessage?: string;
  message?: string;
};

export function getCertificateMessage(cert: CertificateMessageSource): string {
  const custom = (cert.customMessage ?? cert.message)?.trim();

  if (cert.hasCustomMessage && custom) {
    return custom;
  }

  if (cert.certType && CERTIFICATE_DEFAULT_MESSAGES[cert.certType]) {
    return CERTIFICATE_DEFAULT_MESSAGES[cert.certType];
  }

  if (custom) {
    return custom;
  }

  return "";
}

export function splitCertificateMessageLines(message: string): {
  lineOne: string;
  lineTwo: string;
} {
  const trimmed = message.trim();
  if (!trimmed) {
    return { lineOne: "", lineTwo: "" };
  }

  const words = trimmed.split(/\s+/);
  if (words.length <= 1) {
    return { lineOne: trimmed, lineTwo: "" };
  }

  const mid = Math.ceil(words.length / 2);
  return {
    lineOne: words.slice(0, mid).join(" "),
    lineTwo: words.slice(mid).join(" "),
  };
}
