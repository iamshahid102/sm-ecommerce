"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { StoreImage } from "@/components/store/store-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, apiUpload } from "@/lib/api/client";
import { flattenCategories } from "@/lib/category-tree";
import { startNavigation } from "@/lib/navigation-progress";
import { cn } from "@/lib/utils";

function toForm(product) {
  return {
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    category_id: product?.category_id ?? "",
    brand_id: product?.brand_id ?? "",
    price: product?.price != null ? String(product.price) : "",
    discount_price:
      product?.discount_price != null ? String(product.discount_price) : "",
    sku: product?.sku ?? "",
    stock: product?.stock != null ? String(product.stock) : "0",
    low_stock_threshold:
      product?.low_stock_threshold != null
        ? String(product.low_stock_threshold)
        : "5",
    is_published: Boolean(product?.is_published),
    is_featured: Boolean(product?.is_featured),
    meta_title: product?.meta_title ?? "",
    meta_description: product?.meta_description ?? "",
    og_image_url: product?.og_image_url ?? "",
  };
}

function imageState(product) {
  return (product?.images ?? []).map((image, index) => ({
    url: image.url,
    alt_text: image.alt_text ?? "",
    sort_order: image.sort_order ?? index,
    is_primary: Boolean(image.is_primary),
  }));
}

function variantState(product) {
  return (product?.variants ?? []).map((variant, index) => ({
    id: variant.id,
    size: variant.size ?? "",
    color: variant.color ?? "",
    sku: variant.sku ?? "",
    price_delta: String(variant.price_delta ?? 0),
    stock: String(variant.stock ?? 0),
    is_active: variant.is_active !== false,
    sort_order: String(variant.sort_order ?? index),
  }));
}

export function ProductForm({ product, categories, brands }) {
  const router = useRouter();
  const fileInput = useRef(null);
  const [values, setValues] = useState(() => toForm(product));
  const [images, setImages] = useState(() => imageState(product));
  const [variants, setVariants] = useState(() => variantState(product));
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [categoryList, setCategoryList] = useState(
    Array.isArray(categories) ? categories : [],
  );
  const [brandList, setBrandList] = useState(
    Array.isArray(brands) ? brands : [],
  );
  const [taxonomyDialog, setTaxonomyDialog] = useState(null);
  const [taxonomyName, setTaxonomyName] = useState("");
  const [taxonomyParent, setTaxonomyParent] = useState("");
  const [taxonomyPending, setTaxonomyPending] = useState(false);
  const categoryRows = flattenCategories(categoryList);
  const isCategoryDialog = taxonomyDialog === "category";

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function openTaxonomyDialog(type) {
    setTaxonomyDialog(type);
    setTaxonomyName("");
    setTaxonomyParent("");
  }

  async function createTaxonomy(event) {
    event.preventDefault();
    const name = taxonomyName.trim();
    if (!name) return;

    setTaxonomyPending(true);
    try {
      if (taxonomyDialog === "category") {
        const created = await apiFetch("/admin/categories", {
          method: "POST",
          body: { name, parent_id: taxonomyParent || null },
        });
        setCategoryList((current) => [...current, created]);
        update("category_id", created.id);
        toast.success(`Category "${created.name}" created and selected.`);
      } else {
        const created = await apiFetch("/admin/brands", {
          method: "POST",
          body: { name },
        });
        setBrandList((current) => [...current, created]);
        update("brand_id", created.id);
        toast.success(`Brand "${created.name}" created and selected.`);
      }
      setTaxonomyDialog(null);
    } catch (createError) {
      const details = Array.isArray(createError?.details)
        ? createError.details.map((item) => item.message).join(" ")
        : "";
      toast.error(details || createError.message);
    } finally {
      setTaxonomyPending(false);
    }
  }

  function addImage() {
    if (!imageUrl.trim()) return;
    setImages((current) => [
      ...current,
      {
        url: imageUrl.trim(),
        alt_text: "",
        sort_order: current.length,
        is_primary: current.length === 0,
      },
    ]);
    setImageUrl("");
  }

  async function uploadImages(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("bucket", "product");
      formData.append("folder", "products");
      for (const file of files) formData.append("images", file);

      const result = await apiUpload("/admin/uploads", formData);
      setImages((current) => [
        ...current,
        ...(result.images ?? []).map((image, index) => ({
          url: image.url,
          alt_text: "",
          sort_order: current.length + index,
          is_primary: current.length === 0 && index === 0,
        })),
      ]);
      toast.success(`${result.images?.length ?? 0} image(s) uploaded.`);
    } catch (uploadError) {
      toast.error(uploadError.message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function removeImage(index) {
    setImages((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      if (!next.some((image) => image.is_primary) && next.length > 0) {
        next[0] = { ...next[0], is_primary: true };
      }
      return next;
    });
  }

  function updateImage(index, key, value) {
    setImages((current) =>
      current.map((image, itemIndex) =>
        itemIndex === index ? { ...image, [key]: value } : image,
      ),
    );
  }

  function setPrimary(index) {
    setImages((current) =>
      current.map((image, itemIndex) => ({
        ...image,
        is_primary: itemIndex === index,
      })),
    );
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        size: "",
        color: "",
        sku: "",
        price_delta: "0",
        stock: "0",
        is_active: true,
        sort_order: String(current.length),
      },
    ]);
  }

  function updateVariant(index, key, value) {
    setVariants((current) =>
      current.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, [key]: value } : variant,
      ),
    );
  }

  function removeVariant(index) {
    setVariants((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    const body = {
      title: values.title,
      ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
      short_description: values.short_description,
      description: values.description,
      category_id: values.category_id || null,
      brand_id: values.brand_id || null,
      price: values.price,
      discount_price: values.discount_price || null,
      sku: values.sku,
      stock: values.stock,
      low_stock_threshold: values.low_stock_threshold,
      is_published: values.is_published,
      is_featured: values.is_featured,
      meta_title: values.meta_title,
      meta_description: values.meta_description,
      og_image_url: values.og_image_url,
      images: images.map((image, index) => ({
        url: image.url,
        alt_text: image.alt_text,
        sort_order: index,
        is_primary: Boolean(image.is_primary),
      })),
      variants: variants.map((variant, index) => ({
        ...(variant.id ? { id: variant.id } : {}),
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        price_delta: variant.price_delta,
        stock: variant.stock,
        is_active: variant.is_active,
        sort_order: index,
      })),
    };

    setPending(true);
    try {
      if (product) {
        await apiFetch(`/admin/products/${product.id}`, {
          method: "PATCH",
          body,
        });
        toast.success("Product updated.");
      } else {
        await apiFetch("/admin/products", { method: "POST", body });
        toast.success("Product created.");
      }
      startNavigation();
      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      const details = Array.isArray(submitError?.details)
        ? submitError.details.map((item) => item.message).join(" ")
        : "";
      setError(details || submitError.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href="/admin/products">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to products
              </Link>
            </Button>
            <h1 className="mt-2 font-heading text-2xl font-semibold">
              {product ? "Edit product" : "Add product"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {product
                ? "Update product details, images, and variants."
                : "Create a new product for the storefront."}
            </p>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {product ? "Save changes" : "Create product"}
          </Button>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Product could not be saved</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle>Basic details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="product-title">Title</Label>
                  <Input
                    id="product-title"
                    value={values.title}
                    onChange={(event) => update("title", event.target.value)}
                    required
                    minLength={3}
                    maxLength={200}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="product-slug">Slug (optional)</Label>
                    <Input
                      id="product-slug"
                      value={values.slug}
                      onChange={(event) => update("slug", event.target.value)}
                      placeholder="auto-generated-from-title"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-sku">SKU (optional)</Label>
                    <Input
                      id="product-sku"
                      value={values.sku}
                      onChange={(event) => update("sku", event.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="product-category">Category</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => openTaxonomyDialog("category")}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                        New
                      </Button>
                    </div>
                    <select
                      id="product-category"
                      value={values.category_id}
                      onChange={(event) =>
                        update("category_id", event.target.value)
                      }
                      className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="">No category</option>
                      {categoryRows.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    <Link
                      href="/admin/categories"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Manage categories
                    </Link>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="product-brand">Brand</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => openTaxonomyDialog("brand")}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                        New
                      </Button>
                    </div>
                    <select
                      id="product-brand"
                      value={values.brand_id}
                      onChange={(event) =>
                        update("brand_id", event.target.value)
                      }
                      className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="">No brand</option>
                      {brandList.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    <Link
                      href="/admin/brands"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Manage brands
                    </Link>
                  </div>
                </div>
                <div>
                  <Label htmlFor="product-short">Short description</Label>
                  <Textarea
                    id="product-short"
                    value={values.short_description}
                    onChange={(event) =>
                      update("short_description", event.target.value)
                    }
                    maxLength={500}
                    rows={2}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="product-description">Full description</Label>
                  <Textarea
                    id="product-description"
                    value={values.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                    rows={10}
                    className="mt-1.5"
                    placeholder="Describe the product, materials, sizing, and care instructions."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="Paste an image URL"
                  />
                  <Button type="button" variant="outline" onClick={addImage}>
                    <ImagePlus className="size-4" aria-hidden="true" />
                    Add URL
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" aria-hidden="true" />
                    )}
                    Upload
                  </Button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={uploadImages}
                  />
                </div>

                {images.length === 0 ? (
                  <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    No images yet. Upload a file or paste an image URL.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {images.map((image, index) => (
                      <div
                        key={`${image.url}-${index}`}
                        className={cn(
                          "rounded-xl border p-3",
                          image.is_primary &&
                            "border-primary ring-1 ring-primary",
                        )}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                          <StoreImage
                            src={image.url}
                            alt={image.alt_text || "Product"}
                            className="h-full w-full"
                            sizes="300px"
                          />
                        </div>
                        <Input
                          value={image.alt_text}
                          onChange={(event) =>
                            updateImage(index, "alt_text", event.target.value)
                          }
                          placeholder="Alt text"
                          className="mt-2"
                        />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={image.is_primary ? "default" : "outline"}
                            onClick={() => setPrimary(index)}
                          >
                            <Star
                              className={cn(
                                "size-3.5",
                                image.is_primary && "fill-current",
                              )}
                              aria-hidden="true"
                            />
                            {image.is_primary ? "Primary" : "Make primary"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-none">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Variants</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add variant
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {variants.length === 0 ? (
                  <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    Optional. Add size, colour, or other options with their own
                    stock and price adjustment.
                  </p>
                ) : (
                  variants.map((variant, index) => (
                    <div
                      key={variant.id ?? index}
                      className="rounded-xl border p-3"
                    >
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          value={variant.size}
                          onChange={(event) =>
                            updateVariant(index, "size", event.target.value)
                          }
                          placeholder="Size"
                        />
                        <Input
                          value={variant.color}
                          onChange={(event) =>
                            updateVariant(index, "color", event.target.value)
                          }
                          placeholder="Colour"
                        />
                        <Input
                          value={variant.sku}
                          onChange={(event) =>
                            updateVariant(index, "sku", event.target.value)
                          }
                          placeholder="Variant SKU"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price_delta}
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "price_delta",
                              event.target.value,
                            )
                          }
                          placeholder="Price change"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(event) =>
                            updateVariant(index, "stock", event.target.value)
                          }
                          placeholder="Stock"
                        />
                        <label className="flex h-9 items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={variant.is_active}
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "is_active",
                                event.target.checked,
                              )
                            }
                            className="size-4 rounded border-input"
                          />
                          Active
                        </label>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          Remove variant
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle>Pricing and stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="product-price">Price (PKR)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={values.price}
                    onChange={(event) => update("price", event.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="product-discount">
                    Discount price (optional)
                  </Label>
                  <Input
                    id="product-discount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={values.discount_price}
                    onChange={(event) =>
                      update("discount_price", event.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="product-stock">Stock</Label>
                    <Input
                      id="product-stock"
                      type="number"
                      min="0"
                      value={values.stock}
                      onChange={(event) => update("stock", event.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-low">Low stock at</Label>
                    <Input
                      id="product-low"
                      type="number"
                      min="0"
                      value={values.low_stock_threshold}
                      onChange={(event) =>
                        update("low_stock_threshold", event.target.value)
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-start gap-3 rounded-xl border p-3">
                  <input
                    type="checkbox"
                    checked={values.is_published}
                    onChange={(event) =>
                      update("is_published", event.target.checked)
                    }
                    className="mt-0.5 size-4 rounded border-input"
                  />
                  <span>
                    <span className="block text-sm font-medium">Published</span>
                    <span className="block text-xs text-muted-foreground">
                      Show this product in the storefront.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-xl border p-3">
                  <input
                    type="checkbox"
                    checked={values.is_featured}
                    onChange={(event) =>
                      update("is_featured", event.target.checked)
                    }
                    className="mt-0.5 size-4 rounded border-input"
                  />
                  <span>
                    <span className="block text-sm font-medium">Featured</span>
                    <span className="block text-xs text-muted-foreground">
                      Include in featured product sections.
                    </span>
                  </span>
                </label>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="product-meta-title">Meta title</Label>
                  <Input
                    id="product-meta-title"
                    value={values.meta_title}
                    onChange={(event) =>
                      update("meta_title", event.target.value)
                    }
                    maxLength={70}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="product-meta-description">
                    Meta description
                  </Label>
                  <Textarea
                    id="product-meta-description"
                    value={values.meta_description}
                    onChange={(event) =>
                      update("meta_description", event.target.value)
                    }
                    maxLength={180}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="product-og">Open Graph image URL</Label>
                  <Input
                    id="product-og"
                    value={values.og_image_url}
                    onChange={(event) =>
                      update("og_image_url", event.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {product ? "Save changes" : "Create product"}
            </Button>
          </aside>
        </div>
      </form>

      <Dialog
        open={Boolean(taxonomyDialog)}
        onOpenChange={(open) => {
          if (!open) setTaxonomyDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add {isCategoryDialog ? "category" : "brand"}
            </DialogTitle>
            <DialogDescription>
              {isCategoryDialog
                ? "Create a category here and it will be selected for this product automatically."
                : "Create a brand here and it will be selected for this product automatically."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createTaxonomy} className="space-y-4">
            <div>
              <Label htmlFor="quick-taxonomy-name">Name</Label>
              <Input
                id="quick-taxonomy-name"
                value={taxonomyName}
                onChange={(event) => setTaxonomyName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
                autoFocus
                className="mt-1.5"
              />
            </div>
            {isCategoryDialog ? (
              <div>
                <Label htmlFor="quick-taxonomy-parent">
                  Parent category (optional)
                </Label>
                <select
                  id="quick-taxonomy-parent"
                  value={taxonomyParent}
                  onChange={(event) => setTaxonomyParent(event.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">Top-level category</option>
                  {categoryRows.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTaxonomyDialog(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={taxonomyPending}>
                {taxonomyPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
                Create and select
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
