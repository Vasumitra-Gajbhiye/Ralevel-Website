import { getAuthSession } from "@/lib/getAuthSession";
import { getAdminBlogV2BySlug } from "@/lib/data/admin/blogsV2";
import { notFound } from "next/navigation";
import BlogEditorClient from "./BlogEditorClient";

export default async function BlogV2EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAuthSession();
  const { slug } = await params;

  const blog = await getAdminBlogV2BySlug(
    slug,
    session!.userData.id,
    session!.userData.roles,
  );

  if (!blog) notFound();

  return (
    <BlogEditorClient
      slug={slug}
      initialTitle={blog.title}
      initialMetadata={blog.metadata ?? {}}
      initialContent={blog.content}
    />
  );
}
