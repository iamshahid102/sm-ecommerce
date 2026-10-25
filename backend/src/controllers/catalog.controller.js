import {
  createBrand,
  createCategory,
  createProduct,
  deleteBrand,
  deleteCategory,
  deleteProduct,
  getAdminProduct,
  getProductBySlug,
  getRelatedProducts,
  listAdminProducts,
  listBrands,
  listCategories,
  listProducts,
  updateBrand,
  updateCategory,
  updateProduct,
} from "../services/catalog.service.js";
import {
  getPageBySlug,
  listBanners,
  listHomeSections,
  listMenuItems,
  listPages,
  getSettings,
} from "../services/cms.service.js";
import { listProductReviews } from "../services/review.service.js";
import { recordAudit } from "../services/audit.service.js";
import { sendSuccess } from "../utils/http.js";

export async function getProducts(req, res) {
  const result = await listProducts(req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Products loaded.",
    meta: result.meta,
  });
}

export async function getProduct(req, res) {
  const product = await getProductBySlug(req.validated.params.slug);
  const [related, reviews] = await Promise.all([
    getRelatedProducts(product.id, product.category_id, 4),
    listProductReviews(product.id, { page: 1, limit: 6 }),
  ]);

  return sendSuccess(
    res,
    { product, related, reviews },
    { message: "Product loaded." },
  );
}

export async function getProductReviews(req, res) {
  const result = await listProductReviews(req.validated.params.id, {
    page: req.validated.query.page ?? 1,
    limit: req.validated.query.limit ?? 10,
  });
  return sendSuccess(res, result.items, {
    message: "Reviews loaded.",
    meta: { ...result.meta, summary: result.summary },
  });
}

export async function getCategories(req, res) {
  const categories = await listCategories();
  return sendSuccess(res, categories, { message: "Categories loaded." });
}

export async function getBrands(req, res) {
  const brands = await listBrands();
  return sendSuccess(res, brands, { message: "Brands loaded." });
}

export async function getStoreSettings(req, res) {
  const settings = await getSettings();
  return sendSuccess(res, settings, { message: "Settings loaded." });
}

export async function getBanners(req, res) {
  const banners = await listBanners();
  return sendSuccess(res, banners, { message: "Banners loaded." });
}

export async function getMenu(req, res) {
  const items = await listMenuItems();
  return sendSuccess(res, items, { message: "Menu loaded." });
}

export async function getPublishedPage(req, res) {
  const page = await getPageBySlug(req.validated.params.slug);
  return sendSuccess(res, page, { message: "Page loaded." });
}

export async function getPublishedPages(req, res) {
  const pages = await listPages();
  return sendSuccess(res, pages, { message: "Pages loaded." });
}

export async function getHome(req, res) {
  const [settings, banners, sections, categories, featured, latest] =
    await Promise.all([
      getSettings(),
      listBanners(),
      listHomeSections(),
      listCategories(),
      listProducts({ featured: "true", sort: "newest", page: 1, limit: 8 }),
      listProducts({ sort: "newest", page: 1, limit: 8 }),
    ]);

  return sendSuccess(
    res,
    {
      settings,
      banners,
      sections,
      categories,
      featured: featured.items,
      new_arrivals: latest.items,
    },
    { message: "Home page loaded." },
  );
}

export async function adminListProducts(req, res) {
  const result = await listAdminProducts(req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Products loaded.",
    meta: result.meta,
  });
}

export async function adminGetProduct(req, res) {
  const product = await getAdminProduct(req.validated.params.id);
  return sendSuccess(res, product, { message: "Product loaded." });
}

export async function adminCreateProduct(req, res) {
  const product = await createProduct(req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "product.create",
    entityType: "product",
    entityId: product.id,
    changes: { title: req.validated.body.title },
    req,
  });
  return sendSuccess(res, product, {
    status: 201,
    message: "Product created.",
  });
}

export async function adminUpdateProduct(req, res) {
  const product = await updateProduct(
    req.validated.params.id,
    req.validated.body,
  );
  await recordAudit({
    actor: req.user,
    action: "product.update",
    entityType: "product",
    entityId: product.id,
    changes: req.validated.body,
    req,
  });
  return sendSuccess(res, product, { message: "Product updated." });
}

export async function adminDeleteProduct(req, res) {
  const product = await deleteProduct(req.validated.params.id);
  await recordAudit({
    actor: req.user,
    action: "product.delete",
    entityType: "product",
    entityId: product.id,
    changes: { title: product.title },
    req,
  });
  return sendSuccess(res, product, { message: "Product deleted." });
}

export async function adminListCategories(req, res) {
  const categories = await listCategories({ activeOnly: false });
  return sendSuccess(res, categories, { message: "Categories loaded." });
}

export async function adminCreateCategory(req, res) {
  const category = await createCategory(req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "category.create",
    entityType: "category",
    entityId: category.id,
    changes: { name: category.name },
    req,
  });
  return sendSuccess(res, category, {
    status: 201,
    message: "Category created.",
  });
}

export async function adminUpdateCategory(req, res) {
  const category = await updateCategory(
    req.validated.params.id,
    req.validated.body,
  );
  await recordAudit({
    actor: req.user,
    action: "category.update",
    entityType: "category",
    entityId: category.id,
    changes: req.validated.body,
    req,
  });
  return sendSuccess(res, category, { message: "Category updated." });
}

export async function adminDeleteCategory(req, res) {
  await deleteCategory(req.validated.params.id);
  await recordAudit({
    actor: req.user,
    action: "category.delete",
    entityType: "category",
    entityId: req.validated.params.id,
    req,
  });
  return sendSuccess(res, { id: req.validated.params.id }, {
    message: "Category deleted.",
  });
}

export async function adminListBrands(req, res) {
  const brands = await listBrands({ activeOnly: false });
  return sendSuccess(res, brands, { message: "Brands loaded." });
}

export async function adminCreateBrand(req, res) {
  const brand = await createBrand(req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "brand.create",
    entityType: "brand",
    entityId: brand.id,
    changes: { name: brand.name },
    req,
  });
  return sendSuccess(res, brand, { status: 201, message: "Brand created." });
}

export async function adminUpdateBrand(req, res) {
  const brand = await updateBrand(req.validated.params.id, req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "brand.update",
    entityType: "brand",
    entityId: brand.id,
    changes: req.validated.body,
    req,
  });
  return sendSuccess(res, brand, { message: "Brand updated." });
}

export async function adminDeleteBrand(req, res) {
  await deleteBrand(req.validated.params.id);
  await recordAudit({
    actor: req.user,
    action: "brand.delete",
    entityType: "brand",
    entityId: req.validated.params.id,
    req,
  });
  return sendSuccess(res, { id: req.validated.params.id }, {
    message: "Brand deleted.",
  });
}
