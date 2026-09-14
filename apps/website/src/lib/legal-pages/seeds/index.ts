import type { LegalPageSlug } from "@/lib/legal-pages";
import {
  APPLICATION_BOT_PRIVACY_MARKDOWN,
  APPLICATION_BOT_TOS_MARKDOWN,
  RALEVEL_BOT_PRIVACY_MARKDOWN,
  RALEVEL_BOT_TOS_MARKDOWN,
} from "./bots";
import { DISCORD_REGULATIONS_MARKDOWN } from "./discord";
import {
  PRIVACY_POLICY_MARKDOWN,
  TERMS_OF_SERVICE_MARKDOWN,
} from "./website";

export const LEGAL_PAGE_SEEDS: Record<LegalPageSlug, string> = {
  "privacy-policy": PRIVACY_POLICY_MARKDOWN,
  "terms-of-service": TERMS_OF_SERVICE_MARKDOWN,
  "discord-regulations": DISCORD_REGULATIONS_MARKDOWN,
  "application-bot/privacy-policy": APPLICATION_BOT_PRIVACY_MARKDOWN,
  "application-bot/terms-of-service": APPLICATION_BOT_TOS_MARKDOWN,
  "ralevel-bot/privacy-policy": RALEVEL_BOT_PRIVACY_MARKDOWN,
  "ralevel-bot/terms-of-service": RALEVEL_BOT_TOS_MARKDOWN,
};
