import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let product = null;
  let categories = [];
  let brands = [];
  let error = null;

  try {
    [product, categories, brands] = await Promise.all([
      apiFetchServer(`/admin/products/${id}`, { token }),
      apiFetchServer("/admin/categories", { token }),
      apiFetchServer("/admin/brands", { token }),
    ]);
  } catch (loadError) {
    error = loadError;
  }

  if (error) {
    if (error.status === 404) notFound();

    return (
      <Alert variant="destructive">
        <AlertTitle>Product could not load</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ProductForm
      product={product}
      categories={categories ?? []}
      brands={brands ?? []}
    />
  );
}
