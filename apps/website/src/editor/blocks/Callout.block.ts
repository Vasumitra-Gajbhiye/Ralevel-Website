export const CalloutBlock = {
  type: "Callout",

  defaultData: {
    variant: "info" as "info" | "warn" | "success",
    text: "Important note",
  },

  toMdx(data: { variant: "info" | "warn" | "success"; text: string }) {
    return `
<Callout type="${data.variant}">
${data.text}
</Callout>
    `.trim();
  },
};
