import BlogEditorWorkspace from "../../component/BlogEditorWorkspace";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditPageProps) {
  const resolvedParams = await params;
  return {
    title: `Edit Post [${resolvedParams.id.substring(0, 8)}] | Admin Dashboard`,
  };
}

export default async function AdminEditBlogPage({ params }: EditPageProps) {
  const resolvedParams = await params;
  return <BlogEditorWorkspace blogId={resolvedParams.id} />;
}