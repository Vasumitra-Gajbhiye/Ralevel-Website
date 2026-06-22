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

export type ResourceDraftUpdatedBy = {
  userId?: string;
  email?: string;
};

export type ResourceDraft = {
  syllabus: SyllabusItem[];
  notes: NotesItem[];
  worksheets: WorksheetItem[];
  tools: ToolsItem[];
  updatedAt?: string;
  updatedBy?: ResourceDraftUpdatedBy;
};

export type EditableSection = "syllabus" | "notes" | "worksheets" | "tools";

export type ResourceCMSDraftPayload = {
  syllabus?: SyllabusItem[];
  notes?: NotesItem[];
  worksheets?: WorksheetItem[];
  tools?: ToolsItem[];
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
