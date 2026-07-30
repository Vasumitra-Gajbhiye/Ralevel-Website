import MDXImage from "@/app/(others)/blogs/components/MDXImage";
import type { MDXComponents } from "mdx/types";

import BlogHeading from "@/app/(others)/blogs/components/BlogHeading";
import BlogImage from "@/app/(others)/blogs/components/BlogImage";
import BlogParagraph from "@/app/(others)/blogs/components/BlogParagraph";
import Callout from "@/app/(others)/blogs/components/Callout";
import Divider from "@/app/(others)/blogs/components/Divider";
import Heading3 from "@/app/(others)/blogs/components/Heading3";
import KeyPoints from "@/app/(others)/blogs/components/KeyPoints";
import KeyPointsMinimal from "@/app/(others)/blogs/components/KeyPointsMinimal";
import NextRead from "@/app/(others)/blogs/components/NextRead";
import Note from "@/app/(others)/blogs/components/Note";
import Quote from "@/app/(others)/blogs/components/Quote";
import Video from "@/app/(others)/blogs/components/Video";

export function useMDXComponents(): MDXComponents {
  return {
    img: (props) => <MDXImage {...(props as any)} />,
    h2: (props) => <BlogHeading {...(props as any)} />, // ← FIXED
    h3: (props) => <Heading3 {...(props as any)} />, // ← FIXED
    p: (props) => <BlogParagraph {...(props as any)} />,
    Callout,
    Quote,
    BlogImage,
    Divider,
    KeyPoints,
    Note,
    Video,
    NextRead,
    KeyPointsMinimal,
  };
}
