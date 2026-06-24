import { BlogMetadata } from "./metadata";

export function compileMetadata(meta: BlogMetadata) {
  return `export const metadata = {
  slug: "${meta.slug}",
  title: "${meta.title}",
  author: "${meta.author}",
  date: "${meta.date}",
  tag: "${meta.tag}",
  image: "${meta.image}",
};`;
}
