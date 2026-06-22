"use client";

import {
  MAX_NOTES_TAGS,
  MAX_PLAYLIST_DESCRIPTION_LENGTH,
  MAX_THUMBNAIL_SIZE_BYTES,
  MAX_TOOL_DESCRIPTION_LENGTH,
  PLAYLIST_TYPE_OPTIONS,
  RESOURCE_BOARD_OPTIONS,
  THUMBNAIL_ACCEPT,
  THUMBNAIL_FIELD_KEYS,
} from "../constants";
import ThumbnailUploadField, {
  uploadThumbnail,
} from "./ThumbnailUploadField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EditableSection, ThumbnailSection } from "@/types/resources2";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

type FieldConfig = {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "textarea" | "tags" | "select" | "thumbnail";
  placeholder?: string;
  maxLength?: number;
  selectOptional?: boolean;
  selectOptions?: readonly string[];
  selectPlaceholder?: string;
};

const SECTION_FIELDS: Record<EditableSection, FieldConfig[]> = {
  syllabus: [
    { key: "title", label: "Title", required: true },
    { key: "board", label: "Board", required: true, type: "select" },
    { key: "link", label: "Link", required: true, placeholder: "https://" },
  ],
  notes: [
    { key: "title", label: "Title", required: true },
    { key: "source", label: "Source/Credits" },
    { key: "link", label: "Link", required: true, placeholder: "https://" },
    {
      key: "tags",
      label: "Tags",
      type: "tags",
    },
  ],
  worksheets: [
    { key: "title", label: "Title", required: true },
    { key: "link", label: "Link", required: true, placeholder: "https://" },
    {
      key: "board",
      label: "Board",
      type: "select",
      selectOptional: true,
    },
    { key: "topic", label: "Topic" },
    {
      key: "difficulty",
      label: "Difficulty",
      placeholder: "e.g. Easy, Medium, Hard",
    },
    {
      key: "yearRange",
      label: "Year range",
      placeholder: "e.g. 2016–2023",
    },
  ],
  tools: [
    { key: "name", label: "Name", required: true },
    { key: "url", label: "URL", required: true, placeholder: "https://" },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      maxLength: MAX_TOOL_DESCRIPTION_LENGTH,
    },
  ],
  books: [
    { key: "title", label: "Title", required: true },
    { key: "edition", label: "Edition" },
    { key: "buy", label: "Buy link", required: true, placeholder: "https://" },
    { key: "cover", label: "Cover image", type: "thumbnail" },
  ],
  youtubeChannel: [
    { key: "channel", label: "Channel name", required: true },
    {
      key: "channelUrl",
      label: "Channel URL",
      required: true,
      placeholder: "https://",
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
    },
    { key: "thumbnail", label: "Thumbnail", type: "thumbnail" },
  ],
  youtubePlaylist: [
    { key: "title", label: "Title", required: true },
    {
      key: "playlistUrl",
      label: "Playlist URL",
      required: true,
      placeholder: "https://",
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      maxLength: MAX_PLAYLIST_DESCRIPTION_LENGTH,
    },
    { key: "thumbnail", label: "Thumbnail", type: "thumbnail" },
    {
      key: "type",
      label: "Type",
      required: true,
      type: "select",
      selectOptions: PLAYLIST_TYPE_OPTIONS,
      selectPlaceholder: "Select type",
    },
  ],
};

const SECTION_LABELS: Record<EditableSection, string> = {
  syllabus: "Syllabus",
  notes: "Notes",
  worksheets: "Worksheet",
  tools: "Tool",
  books: "Book",
  youtubeChannel: "YouTube Channel",
  youtubePlaylist: "playlist/video",
};

const THUMBNAIL_SECTIONS = new Set<EditableSection>([
  "books",
  "youtubeChannel",
  "youtubePlaylist",
]);

function isThumbnailSection(
  section: EditableSection
): section is ThumbnailSection {
  return THUMBNAIL_SECTIONS.has(section);
}

function normalizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, MAX_NOTES_TAGS);
}

function itemToFormValues(
  section: EditableSection,
  item?: Record<string, unknown>
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of SECTION_FIELDS[section]) {
    if (field.type === "tags" || field.type === "thumbnail") continue;
    const raw = item?.[field.key];
    if (typeof raw === "string") {
      values[field.key] = raw;
    } else {
      values[field.key] = "";
    }
  }
  return values;
}

function getThumbnailKey(section: ThumbnailSection): string {
  return THUMBNAIL_FIELD_KEYS[section];
}

function formValuesToItem(
  section: EditableSection,
  values: Record<string, string>,
  tags: string[],
  thumbnailPath?: string
): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const field of SECTION_FIELDS[section]) {
    if (field.type === "tags") {
      item[field.key] = tags.map((tag) => tag.trim()).filter(Boolean);
      continue;
    }
    if (field.type === "thumbnail") continue;

    const value = values[field.key]?.trim() ?? "";
    if (!value && !field.required) {
      continue;
    }
    if (field.type === "select" && (value === "__none__" || !value)) {
      continue;
    }
    if (field.type === "textarea" && field.maxLength) {
      item[field.key] = value.slice(0, field.maxLength);
    } else {
      item[field.key] = value;
    }
  }

  if (isThumbnailSection(section) && thumbnailPath) {
    item[getThumbnailKey(section)] = thumbnailPath;
  }

  return item;
}

type ItemFormDialogProps = {
  open: boolean;
  section: EditableSection;
  slug: string;
  item?: Record<string, unknown>;
  itemIndex?: number;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Record<string, unknown>, index?: number) => void;
};

export default function ItemFormDialog({
  open,
  section,
  slug,
  item,
  itemIndex,
  onOpenChange,
  onSave,
}: ItemFormDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [clearedExisting, setClearedExisting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const thumbnailKey = isThumbnailSection(section)
    ? getThumbnailKey(section)
    : null;
  const existingThumbnailPath =
    thumbnailKey && typeof item?.[thumbnailKey] === "string"
      ? item[thumbnailKey]
      : undefined;

  useEffect(() => {
    if (open) {
      setValues(itemToFormValues(section, item));
      setTags(section === "notes" ? normalizeTags(item?.tags) : []);
      setPendingFile(null);
      setClearedExisting(false);
      setError(null);
      setIsUploading(false);
    }
  }, [open, section, item]);

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateTag(index: number, value: string) {
    setTags((prev) => prev.map((tag, i) => (i === index ? value : tag)));
  }

  function removeTag(index: number) {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }

  function addTag() {
    if (tags.length >= MAX_NOTES_TAGS) return;
    setTags((prev) => [...prev, ""]);
  }

  function getUrlFieldKey(): string | null {
    switch (section) {
      case "tools":
        return "url";
      case "books":
        return "buy";
      case "youtubeChannel":
        return "channelUrl";
      case "youtubePlaylist":
        return "playlistUrl";
      default:
        return "link";
    }
  }

  async function handleSave() {
    for (const field of SECTION_FIELDS[section]) {
      if (field.required && field.type !== "thumbnail") {
        if (!values[field.key]?.trim()) {
          setError(`${field.label} is required`);
          return;
        }
      }
    }

    const cleanedTags = tags.map((tag) => tag.trim()).filter(Boolean);
    if (cleanedTags.length > MAX_NOTES_TAGS) {
      setError(`Tags are limited to ${MAX_NOTES_TAGS}`);
      return;
    }

    const description = values.description?.trim();
    const descriptionLimit =
      section === "youtubePlaylist"
        ? MAX_PLAYLIST_DESCRIPTION_LENGTH
        : section === "tools"
          ? MAX_TOOL_DESCRIPTION_LENGTH
          : undefined;
    if (
      description &&
      descriptionLimit &&
      description.length > descriptionLimit
    ) {
      setError(`Description must be ${descriptionLimit} characters or fewer`);
      return;
    }

    const urlKey = getUrlFieldKey();
    if (urlKey) {
      const linkValue = values[urlKey]?.trim();
      if (linkValue) {
        try {
          const url = new URL(linkValue);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            setError("Link must start with http:// or https://");
            return;
          }
        } catch {
          setError("Please enter a valid URL");
          return;
        }
      }
    }

    if (pendingFile) {
      if (!THUMBNAIL_ACCEPT.split(",").includes(pendingFile.type)) {
        setError("Thumbnail must be JPEG, PNG, or WebP");
        return;
      }
      if (pendingFile.size > MAX_THUMBNAIL_SIZE_BYTES) {
        setError("Thumbnail must be 5MB or smaller");
        return;
      }
    }

    let thumbnailPath: string | undefined;
    if (isThumbnailSection(section)) {
      if (pendingFile) {
        setIsUploading(true);
        try {
          thumbnailPath = await uploadThumbnail(pendingFile, section, slug);
        } catch (uploadError) {
          setError(
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload thumbnail"
          );
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      } else if (existingThumbnailPath && !clearedExisting) {
        thumbnailPath = existingThumbnailPath;
      }
    }

    onSave(
      formValuesToItem(section, values, cleanedTags, thumbnailPath),
      itemIndex
    );
    onOpenChange(false);
  }

  const isEditing = itemIndex !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit" : "Add"} {SECTION_LABELS[section]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {SECTION_FIELDS[section].map((field) => (
            <div key={field.key} className="space-y-2">
              {field.type === "thumbnail" ? (
                <ThumbnailUploadField
                  label={field.label}
                  existingPath={existingThumbnailPath}
                  pendingFile={pendingFile}
                  onPendingFileChange={setPendingFile}
                  onClearExisting={() => setClearedExisting(true)}
                  clearedExisting={clearedExisting}
                />
              ) : (
                <>
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>

                  {field.type === "select" ? (
                    <Select
                      value={values[field.key] || undefined}
                      onValueChange={(value) =>
                        updateValue(
                          field.key,
                          value === "__none__" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger id={field.key}>
                        <SelectValue
                          placeholder={
                            field.selectPlaceholder ??
                            (field.selectOptional
                              ? "Select board (optional)"
                              : "Select board")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {field.selectOptional && (
                          <SelectItem value="__none__">None</SelectItem>
                        )}
                        {field.selectOptions
                          ? field.selectOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </SelectItem>
                            ))
                          : RESOURCE_BOARD_OPTIONS.map((board) => (
                              <SelectItem key={board} value={board}>
                                {board}
                              </SelectItem>
                            ))}
                        {field.selectOptions &&
                          values[field.key] &&
                          !field.selectOptions.includes(
                            values[field.key] as (typeof PLAYLIST_TYPE_OPTIONS)[number]
                          ) && (
                            <SelectItem value={values[field.key]}>
                              {values[field.key]}
                            </SelectItem>
                          )}
                        {!field.selectOptions &&
                          values[field.key] &&
                          !RESOURCE_BOARD_OPTIONS.includes(
                            values[
                              field.key
                            ] as (typeof RESOURCE_BOARD_OPTIONS)[number]
                          ) && (
                            <SelectItem value={values[field.key]}>
                              {values[field.key]}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <div className="space-y-1">
                      <Textarea
                        id={field.key}
                        value={values[field.key] ?? ""}
                        onChange={(e) =>
                          updateValue(
                            field.key,
                            field.maxLength
                              ? e.target.value.slice(0, field.maxLength)
                              : e.target.value
                          )
                        }
                        placeholder={field.placeholder}
                        rows={3}
                        maxLength={field.maxLength}
                      />
                      {field.maxLength && (
                        <p className="text-xs text-slate-500 text-right">
                          {(values[field.key] ?? "").length}/{field.maxLength}
                        </p>
                      )}
                    </div>
                  ) : field.type === "tags" ? (
                    <div className="space-y-2">
                      {tags.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No tags added yet.
                        </p>
                      ) : (
                        tags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              id={index === 0 ? field.key : undefined}
                              value={tag}
                              onChange={(e) => updateTag(index, e.target.value)}
                              placeholder={`Tag ${index + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTag(index)}
                              aria-label={`Remove tag ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTag}
                          disabled={tags.length >= MAX_NOTES_TAGS}
                        >
                          <Plus className="h-4 w-4" />
                          Add tag
                        </Button>
                        <p className="text-xs text-slate-500">
                          {tags.length}/{MAX_NOTES_TAGS} tags
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Input
                      id={field.key}
                      value={values[field.key] ?? ""}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </>
              )}
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : isEditing ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
