export const BlogParagraphBlock = {
  type: "BlogParagraph",

  defaultData: {
    text: "Write your paragraph here...",
  },

  toMdx(data: { text: string }) {
    return data.text;
  },
};
