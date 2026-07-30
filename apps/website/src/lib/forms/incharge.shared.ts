export type InchargeMember = {
  nickname: string;
  email: string;
  discordUserId: string;
};

export type VoteRecord = {
  adminId: string;
};

export type FormInchargeConfig = {
  inchargeNicknames?: string[];
};

export const MAX_INCHARGE_NICKNAMES = 10;

export function getUnvotedIncharge(
  submission: { votes?: VoteRecord[] },
  members: InchargeMember[],
): InchargeMember[] {
  const votedEmails = new Set(
    (submission.votes ?? []).map((vote) => vote.adminId.toLowerCase()),
  );

  return members.filter((member) => !votedEmails.has(member.email.toLowerCase()));
}

export function allInchargeHaveVoted(
  submission: { votes?: VoteRecord[] },
  members: InchargeMember[],
): boolean {
  if (members.length === 0) return true;
  return getUnvotedIncharge(submission, members).length === 0;
}
