import { compileMetadata } from "./compileMetadata";
import { compileToMdx } from "./compileToMdx";
import { BlogMetadata } from "./metadata";
import { EditorBlock } from "./types";

export function buildExportMdx(metadata: BlogMetadata, blocks: EditorBlock[]) {
  return `
${compileMetadata(metadata)}

# ${metadata.title}

${compileToMdx(blocks)}
`.trim();
}
