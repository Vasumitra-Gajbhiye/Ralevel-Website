export const BlogHeadingBlock = {
  type: "BlogHeading",

  defaultData: {
    text: "New section heading",
  },

  toMdx(data: { text: string }) {
    return `## ${data.text}`;
  },
};
