import { notFound } from "next/navigation";

import { CmsPageForm } from "@/components/admin/cms-page-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Edit CMS page",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminEditCmsPage({ params }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let page = null;
  let error = null;

  try {
    page = await apiFetchServer(`/admin/cms/pages/${id}`, { token });
  } catch (loadError) {
    error = loadError;
  }

  if (error) {
    if (error.status === 404) notFound();

    return (
      <Alert variant="destructive">
        <AlertTitle>Page could not load</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return <CmsPageForm page={page} />;
}
