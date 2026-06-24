import { v4 as uuid } from "uuid";

export type BlockType =
  | "BlogHeading"
  | "BlogParagraph"
  | "Callout"
  | "BlogImage"
  | "Divider"
  | "Heading3"
  | "KeyPoints"
  | "KeyPointsMinimal"
  | "Quote"
  | "Note"
  | "NextRead"
  | "Video";

export const BLOCK_REGISTRY: {
  type: BlockType;
  label: string;
  create: () => any;
}[] = [
  {
    type: "BlogHeading",
    label: "Heading",
    create: () => ({
      id: uuid(),
      type: "BlogHeading",
      data: { text: "Heading" },
    }),
  },
  {
    type: "BlogParagraph",
    label: "Paragraph",
    create: () => ({
      id: uuid(),
      type: "BlogParagraph",
      data: { text: "Write your paragraph..." },
    }),
  },
  {
    type: "Callout",
    label: "Callout",
    create: () => ({
      id: uuid(),
      type: "Callout",
      data: {
        variant: "info",
        text: "This is an info callout.",
      },
    }),
  },
  {
    type: "BlogImage",
    label: "BlogImage",
    create: () => ({
      id: uuid(),
      type: "BlogImage",
      data: {
        src: "Source/link of image",
        alt: "Placeholder text if the image fails to load",
        caption: "This is the caption.",
      },
    }),
  },
  {
    type: "Divider",
    label: "Divider",
    create: () => ({
      id: uuid(),
      type: "Divider",
      data: {},
    }),
  },
  {
    type: "Heading3",
    label: "Heading 3",
    create: () => ({
      id: uuid(),
      type: "Heading3",
      data: { text: "Heading 3" },
    }),
  },
  {
    type: "KeyPoints",
    label: "Key Points",
    create: () => ({
      id: uuid(),
      type: "KeyPoints",
      data: {
        items: ["First point", "Second point"],
        color: "emerald",
        variant: "check",
        title: "",
      },
    }),
  },
  {
    type: "KeyPointsMinimal",
    label: "Key Points (Minimal)",
    create: () => ({
      id: uuid(),
      type: "KeyPointsMinimal",
      data: {
        title: "",
        ordered: false,
        content: "- First point\n- Second point",
      },
    }),
  },
  {
    type: "Quote",
    label: "Quote",
    create: () => ({
      id: uuid(),
      type: "Quote",
      data: {
        text: "",
      },
    }),
  },
  {
    type: "Note",
    label: "Note",
    create: () => ({
      id: uuid(),
      type: "Note",
      data: {
        text: "",
      },
    }),
  },
  {
    type: "NextRead",
    label: "Next Read",
    create: () => ({
      id: uuid(),
      type: "NextRead",
      data: {
        title: "",
        href: "",
      },
    }),
  },
  {
    type: "Video",
    label: "Video",
    create: () => ({
      id: uuid(),
      type: "Video",
      data: {
        src: "",
      },
    }),
  },
];
