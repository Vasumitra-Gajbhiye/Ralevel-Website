import {
  getReminderRoleIds,
  notifyFormReminderDiscord,
} from "@/lib/discord/notifyFormReminder";
import {
  allInchargeHaveVoted,
  getUnvotedIncharge,
  resolveInchargeMembers,
} from "@/lib/forms/incharge";
import {
  istCalendarDaysSince,
  pickReminderTier,
  sleep,
} from "@/lib/forms/reminderSchedule";
import connectDB from "@/lib/mongodb";
import Form from "@/models/Form";
import FormSubmission from "@/models/FormSubmission";

const REMINDER_DELAY_MS = 500;

type ProcessResult = {
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
};

type SubmissionDoc = {
  _id: { toString(): string };
  formSlug: string;
  formType: string;
  submitterName?: string;
  submitterEmail?: string;
  submittedAt: Date;
  votes?: { adminId: string; vote: number }[];
  reminderPings?: {
    day3?: Date | null;
    day5?: Date | null;
    day7?: Date | null;
  };
};

type FormDoc = {
  slug: string;
  title: string;
  formType?: string;
  cycleId?: number;
  inchargeNicknames?: string[];
};

export async function processFormReminders(): Promise<ProcessResult> {
  await connectDB();

  const result: ProcessResult = {
    processed: 0,
    sent: 0,
    skipped: 0,
    errors: 0,
  };

  const forms = (await Form.find({
    inchargeNicknames: { $exists: true, $not: { $size: 0 } },
  })
    .select("slug title formType cycleId inchargeNicknames")
    .lean()) as unknown as FormDoc[];

  for (const form of forms) {
    const inchargeMembers = await resolveInchargeMembers(
      form.inchargeNicknames ?? [],
    );

    if (inchargeMembers.length === 0) continue;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const submissions = (await FormSubmission.find({
      formSlug: form.slug,
      submittedAt: { $gte: sevenDaysAgo },
    })
      .select(
        "_id formSlug formType submitterName submitterEmail submittedAt votes reminderPings",
      )
      .lean()) as unknown as SubmissionDoc[];

    for (const submission of submissions) {
      result.processed += 1;

      if (allInchargeHaveVoted(submission, inchargeMembers)) {
        result.skipped += 1;
        continue;
      }

      const daysSinceSubmission = istCalendarDaysSince(
        new Date(submission.submittedAt),
      );

      const tier = pickReminderTier({
        daysSinceSubmission,
        reminderPings: submission.reminderPings,
      });

      if (!tier) {
        result.skipped += 1;
        continue;
      }

      const unvoted = getUnvotedIncharge(submission, inchargeMembers);
      if (unvoted.length === 0) {
        result.skipped += 1;
        continue;
      }

      const pingUserIds = unvoted.map((member) => member.discordUserId);
      const pingRoleIds =
        tier === 3 ? [] : getReminderRoleIds(tier as 5 | 7);

      try {
        await notifyFormReminderDiscord({
          formTitle: form.title,
          formType: form.formType ?? submission.formType,
          formSlug: form.slug,
          cycleId: form.cycleId ?? 0,
          submitterName: submission.submitterName,
          submitterEmail: submission.submitterEmail,
          submissionId: submission._id.toString(),
          tier,
          daysPending: daysSinceSubmission,
          pingUserIds,
          pingRoleIds,
        });

        await FormSubmission.updateOne(
          { _id: submission._id },
          { $set: { [`reminderPings.day${tier}`]: new Date() } },
        );

        result.sent += 1;
        await sleep(REMINDER_DELAY_MS);
      } catch (err) {
        console.error(
          `[form-reminders] failed for submission ${submission._id}:`,
          err,
        );
        result.errors += 1;
      }
    }
  }

  return result;
}
