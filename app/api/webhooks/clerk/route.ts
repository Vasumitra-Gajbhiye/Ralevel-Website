import { ensureUserData } from "@/lib/ensureUserData";
import { getPostHogClient } from "@/lib/posthog-server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let evt;

  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Verification failed", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (email) {
      const name = `${first_name ?? ""} ${last_name ?? ""}`.trim();
      await ensureUserData({ email, name, trackSignIn: true });
    }
  }

  if (evt.type === "session.created") {
    const { user_id } = evt.data;
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user_id,
      event: "user_signed_in",
      properties: {
        is_new_user: false,
        provider: "clerk",
      },
    });
  }

  return new Response("OK", { status: 200 });
}
