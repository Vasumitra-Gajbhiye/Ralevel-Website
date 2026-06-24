import { BlogHeadingBlock } from "./blocks/BlogHeading.block";
import { BlogParagraphBlock } from "./blocks/BlogParagraph.block";
import { CalloutBlock } from "./blocks/Callout.block";
import { ImageBlock } from "./blocks/Image.block";
import { EditorBlock } from "./types";

const BLOCK_MAP: Record<string, any> = {
  BlogHeading: BlogHeadingBlock,
  BlogParagraph: BlogParagraphBlock,
  Callout: CalloutBlock,
  Image: ImageBlock,
};

export function compileToMdx(blocks: EditorBlock[]) {
  return blocks
    .map((block) => {
      const def = BLOCK_MAP[block.type];
      return def.toMdx(block.data);
    })
    .join("\n\n");
}
