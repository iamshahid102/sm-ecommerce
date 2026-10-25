import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let categories = [];
  let error = null;

  try {
    categories = await apiFetchServer("/admin/categories", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Group products into browsable categories. Parent categories can contain child categories."
      />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Categories could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <TaxonomyManager type="categories" initialItems={categories} />
      )}
    </div>
  );
}
