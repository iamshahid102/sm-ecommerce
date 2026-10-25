import { ProductForm } from "@/components/admin/product-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Add product",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let categories = [];
  let brands = [];
  let error = null;

  try {
    [categories, brands] = await Promise.all([
      apiFetchServer("/admin/categories", { token }),
      apiFetchServer("/admin/brands", { token }),
    ]);
  } catch (loadError) {
    error = loadError;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Product form could not load</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ProductForm
      categories={categories ?? []}
      brands={brands ?? []}
      product={null}
    />
  );
}
