"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminTeamMember } from "@/lib/data/admin/team";
import { TEAM_ROLE_TITLES } from "@/lib/team-constants";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import MemberPhotoField from "./MemberPhotoField";

export type TeamMemberFormValues = {
  name: string;
  title: string;
  discordId: string;
  linkedin: string;
  imgSrc: string;
  showOnHomepage: boolean;
};

const EMPTY_VALUES: TeamMemberFormValues = {
  name: "",
  title: "",
  discordId: "",
  linkedin: "",
  imgSrc: "",
  showOnHomepage: false,
};

function valuesFromMember(member: AdminTeamMember | null): TeamMemberFormValues {
  if (!member) return EMPTY_VALUES;
  return {
    name: member.name,
    title: member.title,
    discordId: member.discordId,
    linkedin: member.linkedin ?? "",
    imgSrc: member.imgSrc ?? "",
    showOnHomepage: Boolean(member.showOnHomepage),
  };
}

type MemberFormDialogProps = {
  open: boolean;
  member: AdminTeamMember | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TeamMemberFormValues) => Promise<void>;
};

export default function MemberFormDialog({
  open,
  member,
  saving,
  onOpenChange,
  onSubmit,
}: MemberFormDialogProps) {
  const isEdit = Boolean(member);
  const [values, setValues] = useState<TeamMemberFormValues>(EMPTY_VALUES);

  useEffect(() => {
    if (open) {
      setValues(valuesFromMember(member));
    }
  }, [open, member]);

  function update<K extends keyof TeamMemberFormValues>(
    key: K,
    value: TeamMemberFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await onSubmit({
      ...values,
      name: values.name.trim(),
      title: values.title.trim(),
      discordId: values.discordId.trim(),
      linkedin: values.linkedin.trim(),
      imgSrc: values.imgSrc.trim(),
    });
  }

  const canSubmit =
    values.name.trim().length > 0 &&
    values.title.trim().length > 0 &&
    values.discordId.trim().length > 0 &&
    !saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit member" : "Add member"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this team card. Changes appear on /team immediately."
              : "Create a card that will appear on the public team page."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <MemberPhotoField
            memberKey={member?._id ?? "new"}
            value={values.imgSrc}
            name={values.name}
            onChange={(imgSrc) => update("imgSrc", imgSrc)}
          />

          <div className="space-y-1.5">
            <Label htmlFor="team-name">Name</Label>
            <Input
              id="team-name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="team-title">Title</Label>
            <Input
              id="team-title"
              list="team-role-titles"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Administrator"
              required
            />
            <datalist id="team-role-titles">
              {TEAM_ROLE_TITLES.map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="team-discord">Discord user ID</Label>
            <Input
              id="team-discord"
              value={values.discordId}
              onChange={(e) => update("discordId", e.target.value)}
              placeholder="123456789012345678"
              required
            />
            <p className="text-xs text-neutral-500">
              Numeric Discord user ID, not the username.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="team-linkedin">LinkedIn URL</Label>
            <Input
              id="team-linkedin"
              value={values.linkedin}
              onChange={(e) => update("linkedin", e.target.value)}
              placeholder="https://www.linkedin.com/in/…"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.showOnHomepage}
              onCheckedChange={(checked) =>
                update("showOnHomepage", checked === true)
              }
            />
            Show on homepage
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save" : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
