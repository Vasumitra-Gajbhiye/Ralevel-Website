import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

// Optional locally: without a token, analytics are simply off.
if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    // Include the defaults option as required by PostHog
    defaults: "2026-01-30",
    // Enables capturing unhandled exceptions via Error Tracking
    capture_exceptions: true,
    // Turn on debug in development mode
    debug: process.env.NODE_ENV === "development",
  });
}
