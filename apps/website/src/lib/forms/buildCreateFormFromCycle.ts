import type {
  CreateFormValues,
  IntroductionBlock2,
  FormSection,
} from "@/types/form";

type SourceFormField = {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  multiple?: boolean;
  minSelections?: number;
  maxSelections?: number;
  allowOther?: boolean;
};

type SourceFormSection = {
  id: string;
  title: string;
  subtitle?: string;
  fields: SourceFormField[];
};

type SourceIntroductionBlock =
  | {
      id?: string;
      type: "paragraph";
      text: string;
    }
  | {
      id?: string;
      type: "bullet_list";
      bulletColor: string;
      items: string[];
    };

export type SourceFormForCopy = {
  title: string;
  slug: string;
  formType?: string;
  banner?: {
    type: "gradient" | "image";
    value: string;
  };
  ctaText?: string;
  introductionBlocks?: SourceIntroductionBlock[];
  sections?: SourceFormSection[];
  confirmationMessage?: {
    title: string;
    body: string[];
    contactEmail: string;
  };
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function incrementTitle(title: string, nextCycleId: number): string {
  const match = title.match(/^(.*?)(\d+)\s*$/);
  if (match) {
    return `${match[1]}${nextCycleId}`;
  }
  return `${title} ${nextCycleId}`;
}

function cloneIntroductionBlocks(
  blocks: SourceIntroductionBlock[] | undefined,
): IntroductionBlock2[] {
  if (!Array.isArray(blocks)) return [];

  return blocks.map((block) => {
    if (block.type === "paragraph") {
      return {
        id: crypto.randomUUID(),
        type: "paragraph" as const,
        text: block.text ?? "",
      };
    }

    return {
      id: crypto.randomUUID(),
      type: "bullet_list" as const,
      bulletColor: block.bulletColor ?? "#22C55E",
      items: Array.isArray(block.items) ? [...block.items] : [""],
    };
  });
}

function cloneSections(sections: SourceFormSection[] | undefined): FormSection[] {
  if (!Array.isArray(sections)) return [];

  return sections.map((section) => ({
    id: crypto.randomUUID(),
    title: section.title ?? "",
    subtitle: section.subtitle ?? "",
    fields: (section.fields ?? []).map((field) => ({
      id: crypto.randomUUID(),
      label: field.label ?? "",
      type: field.type as FormSection["fields"][number]["type"],
      required: Boolean(field.required),
      placeholder: field.placeholder ?? "",
      options: Array.isArray(field.options) ? [...field.options] : [],
      multiple: Boolean(field.multiple),
      minSelections: field.minSelections,
      maxSelections: field.maxSelections,
      allowOther: Boolean(field.allowOther),
    })),
  }));
}

export function buildCreateFormFromCycle(
  source: SourceFormForCopy,
  {
    formType,
    nextCycleId,
  }: {
    formType: string;
    nextCycleId: number;
  },
): CreateFormValues {
  const banner = source.banner?.value
    ? {
        type: "gradient" as const,
        value: source.banner.value,
      }
    : {
        type: "gradient" as const,
        value: "",
      };

  return {
    title: incrementTitle(source.title ?? "", nextCycleId),
    subtitle: "",
    cycleId: nextCycleId,
    slug: `${formType}-intake-${nextCycleId}`,
    formType,
    banner,
    ctaText: source.ctaText ?? "Submit Application",
    introductionBlocks: cloneIntroductionBlocks(source.introductionBlocks),
    sections: cloneSections(source.sections),
    confirmationMessage: source.confirmationMessage
      ? clone(source.confirmationMessage)
      : {
          title: "",
          body: [],
          contactEmail: "",
        },
  };
}
