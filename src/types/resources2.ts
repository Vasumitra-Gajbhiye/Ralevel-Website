export type SyllabusItem = {
  title: string;
  board: string;
  link: string;
};

export type NotesItem = {
  title: string;
  source?: string;
  link: string;
  tags?: string[];
};

export type WorksheetItem = {
  title: string;
  link: string;
  board?: string;
  topic?: string;
  difficulty?: string;
  yearRange?: string;
};

export type ToolsItem = {
  name: string;
  url: string;
  description?: string;
};

export type BookItem = {
  title: string;
  edition?: string;
  cover?: string;
  buy: string;
};

export type YoutubeChannelItem = {
  channel: string;
  channelUrl: string;
  description?: string;
  thumbnail?: string;
};

export type YoutubePlaylistItem = {
  title: string;
  playlistUrl: string;
  description?: string;
  thumbnail?: string;
  type?: string;
};

export type ResourceDraftUpdatedBy = {
  userId?: string;
  email?: string;
};

export type ResourceDraft = {
  syllabus: SyllabusItem[];
  notes: NotesItem[];
  worksheets: WorksheetItem[];
  tools: ToolsItem[];
  books: BookItem[];
  youtubeChannel: YoutubeChannelItem[];
  youtubePlaylist: YoutubePlaylistItem[];
  updatedAt?: string;
  updatedBy?: ResourceDraftUpdatedBy;
};

export type EditableSection =
  | "syllabus"
  | "notes"
  | "worksheets"
  | "tools"
  | "books"
  | "youtubeChannel"
  | "youtubePlaylist";

export type ThumbnailSection = "books" | "youtubeChannel" | "youtubePlaylist";

export type ResourceCMSDraftPayload = {
  syllabus?: SyllabusItem[];
  notes?: NotesItem[];
  worksheets?: WorksheetItem[];
  tools?: ToolsItem[];
  books?: BookItem[];
  youtubeChannel?: YoutubeChannelItem[];
  youtubePlaylist?: YoutubePlaylistItem[];
};

export type AdminResourceSubject = {
  _id: string;
  subject: string;
  slug: string;
  hasUnpublishedChanges: boolean;
  publishedAt?: string;
  draftUpdatedAt?: string;
  updatedAt: string;
};

export type ResourceCMSEditorData = {
  _id: string;
  subject: string;
  slug: string;
  level: string;
  hasUnpublishedChanges: boolean;
  publishedAt?: string;
  draft: ResourceDraft;
};

export type ResourceCMSSections = {
  syllabus: SyllabusItem[];
  notes: NotesItem[];
  worksheets: WorksheetItem[];
  tools: ToolsItem[];
  books: BookItem[];
  youtubeChannel: YoutubeChannelItem[];
  youtubePlaylist: YoutubePlaylistItem[];
};

export type ResourceCmsActor = {
  userId: string;
  email: string;
};

export type ResourceCmsRevisionKind = "edit" | "backup";
export type ResourceCmsRevisionAction = "save_draft" | "publish" | "restore";
export type ResourceCmsSnapshotScope = "draft" | "live";

export type ResourceCmsChange =
  | {
      type: "item_added";
      section: EditableSection;
      index: number;
      label: string;
    }
  | {
      type: "item_removed";
      section: EditableSection;
      index: number;
      label: string;
    }
  | {
      type: "field_changed";
      section: EditableSection;
      index: number;
      field: string;
      label: string;
      before: string;
      after: string;
    }
  | { type: "section_unchanged"; section: EditableSection };

export type ResourceCmsGroupedChange =
  | {
      type: "added";
      section: EditableSection;
      sectionLabel: string;
      label: string;
    }
  | {
      type: "removed";
      section: EditableSection;
      sectionLabel: string;
      label: string;
    }
  | {
      type: "modified";
      section: EditableSection;
      sectionLabel: string;
      label: string;
      fields: {
        field: string;
        fieldLabel: string;
        before: string;
        after: string;
      }[];
    };

export type ResourceCmsRevisionListItem = {
  _id: string;
  slug: string;
  subject: string;
  kind: ResourceCmsRevisionKind;
  action: ResourceCmsRevisionAction;
  actor: ResourceCmsActor;
  createdAt: string;
  snapshotScope: ResourceCmsSnapshotScope;
  contentHash: string;
  summary: string;
  restoredFromId?: string;
  message?: string;
};

export type ResourceCmsRevisionDetail = ResourceCmsRevisionListItem & {
  changes: ResourceCmsChange[];
  hasSnapshot: boolean;
};
