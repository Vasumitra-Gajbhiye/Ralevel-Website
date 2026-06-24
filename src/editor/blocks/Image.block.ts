export const ImageBlock = {
  type: "Image",

  defaultData: {
    src: "",
    alt: "",
    caption: "",
  },

  toMdx(data: { src: string; alt: string; caption?: string }) {
    return `<BlogImage
  src="${data.src}"
  alt="${data.alt}"
  caption="${data.caption ?? ""}"
/>`;
  },
};
