export type EditorBlock =
  | {
      id: string;
      type: "BlogHeading";
      data: {
        text: string;
      };
    }
  | {
      id: string;
      type: "BlogParagraph";
      data: {
        text: string;
      };
    }
  | {
      id: string;
      type: "Callout";
      data: {
        variant: "info" | "warn" | "success";
        text: string;
      };
    }
  | {
      id: string;
      type: "Image";
      data: {
        src: string;
        alt: string;
        caption?: string;
      };
    };
