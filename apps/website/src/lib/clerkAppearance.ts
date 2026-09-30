import type { ClerkProvider } from "@clerk/nextjs";
import type { ComponentProps } from "react";

type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

// Clerk's styles are left unlayered on purpose: Tailwind v3's preflight is
// unlayered too, so putting Clerk in a CSS layer lets `* { border-width: 0 }`
// and `button { background: transparent }` strip its borders and buttons.
// Element overrides use style objects rather than Tailwind classes so they
// merge into Clerk's own CSS-in-JS instead of racing it on insertion order.
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#2563eb",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#ffffff",
    colorForeground: "#0f172a",
    colorNeutral: "#0f172a",
    colorMutedForeground: "#64748b",
    colorInput: "#ffffff",
    colorInputForeground: "#0f172a",
    colorRing: "rgba(37, 99, 235, 0.35)",
    colorDanger: "#dc2626",
    borderRadius: "0.625rem",
    fontFamily: "inherit",
  },
  options: {
    socialButtonsVariant: "blockButton",
  },
  elements: {
    rootBox: { width: "100%", letterSpacing: "normal" },
    cardBox: {
      width: "100%",
      maxWidth: "26rem",
      borderRadius: "1rem",
      border: "1px solid #e2e8f0",
      boxShadow:
        "0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -12px rgba(15, 23, 42, 0.12)",
    },
    card: { padding: "2rem 2rem 1.75rem" },
    headerTitle: { fontSize: "1.375rem", fontWeight: 600 },
    headerSubtitle: { fontSize: "0.875rem" },
    socialButtonsBlockButton: { height: "2.75rem" },
    socialButtonsBlockButtonText: { fontSize: "0.875rem", fontWeight: 500 },
    dividerLine: { backgroundColor: "#e2e8f0" },
    dividerText: { color: "#94a3b8", fontSize: "0.75rem" },
    formFieldLabel: { fontSize: "0.8125rem", fontWeight: 500 },
    formFieldInput: { height: "2.75rem", fontSize: "0.875rem" },
    formButtonPrimary: {
      height: "2.75rem",
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none",
      "&:hover": { backgroundColor: "#1d4ed8" },
    },
    footer: { background: "#f8fafc" },
    footerActionText: { fontSize: "0.8125rem" },
    footerActionLink: {
      fontSize: "0.8125rem",
      fontWeight: 600,
      color: "#2563eb",
      "&:hover": { color: "#1d4ed8" },
    },
  },
};
