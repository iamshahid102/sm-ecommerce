import {
  createBanner,
  createHomeSection,
  createMenuItem,
  createPage,
  deleteBanner,
  deleteContactMessage,
  deleteHomeSection,
  deleteMenuItem,
  deletePage,
  getPageById,
  listBanners,
  listContactMessages,
  listHomeSections,
  listMenuItems,
  listPages,
  listSubscribers,
  markContactRead,
  unsubscribeNewsletter,
  updateBanner,
  updateHomeSection,
  updateMenuItem,
  updatePage,
  updateSettings,
  getSettings,
} from "../services/cms.service.js";
import {
  createContactMessage,
  exportSubscribersCsv,
  subscribeNewsletter,
} from "../services/marketing.service.js";
import { listAuditLogs } from "../services/audit.service.js";
import { recordAudit } from "../services/audit.service.js";
import { sendSuccess } from "../utils/http.js";

function sendCsv(res, filename, csv) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename.replace(/[^a-z0-9._-]/gi, "-")}"`,
  );
  return res.status(200).send(`\uFEFF${csv}`);
}

export async function postContact(req, res) {
  const result = await createContactMessage(req.validated.body);
  return sendSuccess(res, result, {
    status: 201,
    message: "Your message has been sent.",
  });
}

export async function postNewsletter(req, res) {
  const result = await subscribeNewsletter(req.validated.body);
  return sendSuccess(res, result, {
    status: result.already_subscribed ? 200 : 201,
    message: "You are subscribed.",
  });
}

export async function postUnsubscribe(req, res) {
  const result = await unsubscribeNewsletter(req.validated.body.token);
  return sendSuccess(res, result, {
    message: "You have been unsubscribed.",
  });
}

export async function adminGetSettings(req, res) {
  const settings = await getSettings();
  return sendSuccess(res, settings, { message: "Settings loaded." });
}

export async function adminUpdateSettings(req, res) {
  const settings = await updateSettings(req.validated.body, req.user);
  await recordAudit({
    actor: req.user,
    action: "settings.update",
    entityType: "site_settings",
    entityId: "1",
    changes: req.validated.body,
    req,
  });
  return sendSuccess(res, settings, { message: "Settings saved." });
}

export async function adminListBanners(req, res) {
  const banners = await listBanners({ activeOnly: false });
  return sendSuccess(res, banners, { message: "Banners loaded." });
}

export async function adminCreateBanner(req, res) {
  const banner = await createBanner(req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "banner.create",
    entityType: "banner",
    entityId: banner.id,
    changes: { title: banner.title },
    req,
  });
  return sendSuccess(res, banner, { status: 201, message: "Banner created." });
}

export async function adminUpdateBanner(req, res) {
  const banner = await updateBanner(req.validated.params.id, req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "banner.update",
    entityType: "banner",
    entityId: banner.id,
    changes: req.validated.body,
    req,
  });
  return sendSuccess(res, banner, { message: "Banner updated." });
}

export async function adminDeleteBanner(req, res) {
  await deleteBanner(req.validated.params.id);
  await recordAudit({
    actor: req.user,
    action: "banner.delete",
    entityType: "banner",
    entityId: req.validated.params.id,
    req,
  });
  return sendSuccess(res, { id: req.validated.params.id }, {
    message: "Banner deleted.",
  });
}

export async function adminListHomeSections(req, res) {
  const sections = await listHomeSections({ activeOnly: false });
  return sendSuccess(res, sections, { message: "Home sections loaded." });
}

export async function adminCreateHomeSection(req, res) {
  const section = await createHomeSection(req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "home_section.create",
    entityType: "home_section",
    entityId: section.id,
    changes: { section_key: section.section_key },
    req,
  });
  return sendSuccess(res, section, { status: 201, message: "Section created." });
}

export async function adminUpdateHomeSection(req, res) {
  const section = await updateHomeSection(
    req.validated.params.id,
    req.validated.body,
  );
  await recordAudit({
    actor: req.user,
    action: "home_section.update",
    entityType: "home_section",
    entityId: section.id,
    changes: req.validated.body,
    req,
  });
  return sendSuccess(res, section, { message: "Section updated." });
}

export async function adminDeleteHomeSection(req, res) {
  await deleteHomeSection(req.validated.params.id);
  await recordAudit({
    actor: req.user,
    action: "home_section.delete",
    entityType: "home_section",
    entityId: req.validated.params.id,
    req,
  });
  return sendSuccess(res, { id: req.validated.params.id }, {
    message: "Section deleted.",
  });
}

export async function adminListPages(req, res) {
  const pages = await listPages({ publishedOnly: false });
  return sendSuccess(res, pages, { message: "Pages loaded." });
}

export async function adminGetPage(req, res) {
  const page = await getPageById(req.validated.params.id);
  return sendSuccess(res, page, { message: "Page loaded." });
}

export async function adminCreatePage(req, res) {
  const page = await createPage(req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "cms_page.create",
    entityType: "cms_page",
    entityId: page.id,
    changes: { slug: page.slug, title: page.title },
    req,
  });
  return sendSuccess(res, page, { status: 201, message: "Page created." });
}

export async function adminUpdatePage(req, res) {
  const page = await updatePage(req.validated.params.id, req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "cms_page.update",
    entityType: "cms_page",
    entityId: page.id,
    changes: { slug: page.slug, title: page.title },
    req,
  });
  return sendSuccess(res, page, { message: "Page updated." });
}

export async function adminDeletePage(req, res) {
  await deletePage(req.validated.params.id);
  await recordAudit({
    actor: req.user,
    action: "cms_page.delete",
    entityType: "cms_page",
    entityId: req.validated.params.id,
    req,
  });
  return sendSuccess(res, { id: req.validated.params.id }, {
    message: "Page deleted.",
  });
}

export async function adminListMenu(req, res) {
  const items = await listMenuItems({ activeOnly: false });
  return sendSuccess(res, items, { message: "Menu loaded." });
}

export async function adminCreateMenuItem(req, res) {
  const item = await createMenuItem(req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "menu_item.create",
    entityType: "menu_item",
    entityId: item.id,
    changes: { label: item.label },
    req,
  });
  return sendSuccess(res, item, { status: 201, message: "Menu item created." });
}

export async function adminUpdateMenuItem(req, res) {
  const item = await updateMenuItem(req.validated.params.id, req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "menu_item.update",
    entityType: "menu_item",
    entityId: item.id,
    changes: req.validated.body,
    req,
  });
  return sendSuccess(res, item, { message: "Menu item updated." });
}

export async function adminDeleteMenuItem(req, res) {
  await deleteMenuItem(req.validated.params.id);
  await recordAudit({
    actor: req.user,
    action: "menu_item.delete",
    entityType: "menu_item",
    entityId: req.validated.params.id,
    req,
  });
  return sendSuccess(res, { id: req.validated.params.id }, {
    message: "Menu item deleted.",
  });
}

export async function adminListMessages(req, res) {
  const result = await listContactMessages(req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Messages loaded.",
    meta: result.meta,
  });
}

export async function adminReadMessage(req, res) {
  const message = await markContactRead(
    req.validated.params.id,
    req.validated.body.is_read,
  );
  await recordAudit({
    actor: req.user,
    action: "contact_message.read",
    entityType: "contact_message",
    entityId: message.id,
    changes: { is_read: message.is_read },
    req,
  });
  return sendSuccess(res, message, { message: "Message updated." });
}

export async function adminDeleteMessage(req, res) {
  await deleteContactMessage(req.validated.params.id);
  return sendSuccess(res, { id: req.validated.params.id }, {
    message: "Message deleted.",
  });
}

export async function adminListSubscribers(req, res) {
  const result = await listSubscribers(req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Subscribers loaded.",
    meta: result.meta,
  });
}

export async function adminExportSubscribers(req, res) {
  const csv = await exportSubscribersCsv();
  return sendCsv(res, "newsletter-subscribers.csv", csv);
}

export async function adminListAudit(req, res) {
  const result = await listAuditLogs(req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Audit logs loaded.",
    meta: result.meta,
  });
}
