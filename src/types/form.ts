export type FormField = {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "url" | "file" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
};
export type FormSection = {
  id: string;
  title: string;
  subtitle?: string;
  fields: FormField[];
};

export type IntroductionBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "bullet_list";
      bulletColor: string;
      items: string[];
    };

export type FormDocument = {
  _id: string;
  title: string;
  slug: string;
  status: "open" | "closed";
  formType: string;
  banner?: {
    type: "gradient" | "image";
    value: string;
  };

  ctaText?: string;

  confirmationMessage?: {
    title: string;
    body: string[];
    contactEmail: string;
  };

  introductionBlocks?: IntroductionBlock[];

  sections: FormSection[];

  createdAt: string;
  updatedAt: string;
};

export type IntroductionBlock2 =
  | {
      id: string;
      type: "paragraph";
      text: string;
    }
  | {
      id: string;
      type: "bullet_list";
      bulletColor: string;
      items: string[];
    };

export type CreateFormValues = {
  title: string;
  subtitle: string;
  cycleId: number;
  slug: string;
  formType: string;
  banner: {
    type: "gradient";
    value: string;
  };
  ctaText: string;
  introductionBlocks: IntroductionBlock2[];
  sections: FormSection[];
  confirmationMessage: {
    title: string;
    body: string[];
    contactEmail: string;
  };
};
