import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Brands",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let brands = [];
  let error = null;

  try {
    brands = await apiFetchServer("/admin/brands", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Brands"
        description="Manage the brands shown on products and in storefront filters."
      />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Brands could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <TaxonomyManager type="brands" initialItems={brands} />
      )}
    </div>
  );
}
