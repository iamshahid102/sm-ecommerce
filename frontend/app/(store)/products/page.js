import { CatalogPageView } from "@/components/store/catalog-page";

export const metadata = {
  title: "Shop all products",
  description:
    "Browse every product at SM Store with filters for category, brand, price, and rating.",
};

export const dynamic = "force-dynamic";

export default function ProductsPage({ searchParams }) {
  return <CatalogPageView searchParams={searchParams} />;
}
