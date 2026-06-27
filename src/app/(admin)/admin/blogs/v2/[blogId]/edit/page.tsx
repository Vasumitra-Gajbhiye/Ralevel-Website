import { getAuthSession } from "@/lib/getAuthSession";
import { getAdminBlogV2ById } from "@/lib/data/admin/blogsV2";
import WriterRoleGate from "@/components/blogs-v2/WriterRoleGate";
import { needsWriterRoleSelfGrant } from "@/lib/roles";
import { notFound } from "next/navigation";
import BlogEditorClient from "./BlogEditorClient";

export default async function BlogV2EditPage({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const session = await getAuthSession();
  const { blogId } = await params;
  const roles = session!.userData.roles;

  if (needsWriterRoleSelfGrant(roles)) {
    return (
      <WriterRoleGate needsWriterRole>
        <div className="min-h-[50vh]" />
      </WriterRoleGate>
    );
  }

  const blog = await getAdminBlogV2ById(
    blogId,
    session!.userData.id,
    roles,
  );

  if (!blog) notFound();

  const {
    author: _author,
    authorBio: _authorBio,
    authorFollowers: _authorFollowers,
    ...editorMetadata
  } = blog.metadata ?? {};

  return (
    <BlogEditorClient
      blogId={blogId}
      initialTitle={blog.title}
      initialMetadata={editorMetadata}
      authorProfile={blog.author}
      initialContent={blog.content}
      status={blog.status}
      slug={blog.slug}
      previewToken={blog.previewToken}
      reviewNote={blog.reviewNote}
      submittedAt={blog.submittedAt}
      reviewType={blog.reviewType}
    />
  );
}
