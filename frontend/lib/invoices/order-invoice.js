import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { PAYMENT_STATUS_LABELS, paymentMethodLabel } from "@/lib/commerce";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const colors = {
  ink: rgb(0.06, 0.09, 0.16),
  slate: rgb(0.39, 0.45, 0.55),
  muted: rgb(0.58, 0.64, 0.69),
  border: rgb(0.89, 0.91, 0.94),
  surface: rgb(0.97, 0.98, 0.99),
  primary: rgb(0.15, 0.39, 0.92),
  primarySoft: rgb(0.94, 0.97, 1),
  white: rgb(1, 1, 1),
  green: rgb(0.09, 0.64, 0.29),
  greenSoft: rgb(0.94, 0.99, 0.96),
};

function safeText(value) {
  return String(value ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

function money(value) {
  const amount = Number(value ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `Rs ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(safeAmount)}`;
}

function countryName(value) {
  const country = safeText(value);

  if (!country) return "Pakistan";
  if (country.toUpperCase() === "PK") return "Pakistan";

  return country;
}

function formatInvoiceDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return `${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  }).format(date)} PKT`;
}

function wrapText(text, font, size, maxWidth) {
  const words = safeText(text).split(" ").filter(Boolean);

  if (words.length === 0) return [""];

  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) {
      lines.push(line);
      line = "";
    }

    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      line = word;
      continue;
    }

    let chunk = "";

    for (const character of word) {
      const next = `${chunk}${character}`;

      if (font.widthOfTextAtSize(next, size) > maxWidth && chunk) {
        lines.push(chunk);
        chunk = character;
      } else {
        chunk = next;
      }
    }

    line = chunk;
  }

  if (line) lines.push(line);

  return lines;
}

function drawText(page, text, options) {
  const {
    x = MARGIN,
    y,
    size = 9,
    font,
    color = colors.ink,
    align = "left",
    right = PAGE_WIDTH - MARGIN,
    maxWidth,
  } = options;

  const value = safeText(text);

  if (!value) return y - size;

  const width = font.widthOfTextAtSize(value, size);
  const drawX = align === "right" ? right - width : x;

  page.drawText(value, {
    x: drawX,
    y: y - size,
    size,
    font,
    color,
    ...(maxWidth ? { maxWidth } : {}),
  });

  return y - size;
}

function drawLabelValue(page, { x, y, label, value, valueSize = 10, bold }) {
  drawText(page, label, {
    x,
    y,
    size: 7,
    font: bold,
    color: colors.slate,
  });
  drawText(page, value, {
    x,
    y: y - 14,
    size: valueSize,
    font: bold,
    color: colors.ink,
  });
}

function drawHeader(page, { order, firstPage, regular, bold }) {
  const headerHeight = firstPage ? 92 : 62;

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - headerHeight,
    width: PAGE_WIDTH,
    height: headerHeight,
    color: colors.ink,
  });
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 6,
    width: PAGE_WIDTH,
    height: 6,
    color: colors.primary,
  });

  drawText(page, "SM STORE", {
    x: MARGIN,
    y: PAGE_HEIGHT - 34,
    size: firstPage ? 23 : 18,
    font: bold,
    color: colors.white,
  });

  drawText(page, "EVERYDAY ESSENTIALS", {
    x: MARGIN,
    y: PAGE_HEIGHT - (firstPage ? 62 : 60),
    size: 7,
    font: bold,
    color: rgb(0.75, 0.84, 1),
  });

  if (firstPage) {
    drawText(page, "ORDER INVOICE", {
      y: PAGE_HEIGHT - 36,
      size: 21,
      font: bold,
      color: colors.white,
      align: "right",
    });
    drawText(page, "smstoreweb.vercel.app", {
      x: MARGIN,
      y: PAGE_HEIGHT - 78,
      size: 8,
      font: regular,
      color: rgb(0.75, 0.84, 1),
    });

    return PAGE_HEIGHT - headerHeight - 26;
  }

  drawText(page, `ORDER INVOICE - ${order.order_number || "Order"}`, {
    y: PAGE_HEIGHT - 38,
    size: 10,
    font: bold,
    color: colors.white,
    align: "right",
  });

  return PAGE_HEIGHT - headerHeight - 20;
}

function drawMetaBar(page, { order, y, bold }) {
  const height = 58;

  page.drawRectangle({
    x: MARGIN,
    y: y - height,
    width: CONTENT_WIDTH,
    height,
    color: colors.surface,
    borderColor: colors.border,
    borderWidth: 0.7,
  });

  const columns = [
    {
      label: "ORDER NUMBER",
      value: order.order_number || "-",
    },
    {
      label: "ORDER DATE",
      value: formatInvoiceDate(order.created_at),
    },
    {
      label: "PAYMENT METHOD",
      value: paymentMethodLabel(order.payment_method) || "-",
    },
    {
      label: "PAYMENT STATUS",
      value: PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status || "-",
    },
  ];
  const columnWidth = CONTENT_WIDTH / columns.length;

  columns.forEach((column, index) => {
    const x = MARGIN + 12 + columnWidth * index;

    drawLabelValue(page, {
      x,
      y: y - 15,
      label: column.label,
      value: column.value,
      valueSize: index === 1 ? 8.5 : 10,
      bold,
    });
  });

  return y - height - 22;
}

function drawCustomerBlock(page, { x, y, width, name, phone, address, bold, regular }) {
  let cursor = y;

  drawText(page, "CUSTOMER", {
    x,
    y: cursor,
    size: 7,
    font: bold,
    color: colors.primary,
  });
  cursor -= 17;

  cursor = drawText(page, name || "-", {
    x,
    y: cursor,
    size: 11,
    font: bold,
    color: colors.ink,
  });
  cursor -= 15;

  if (phone) {
    cursor = drawText(page, `Contact: ${phone}`, {
      x,
      y: cursor,
      size: 8.5,
      font: regular,
      color: colors.ink,
    });
    cursor -= 12;
  }

  cursor -= 10;
  drawText(page, "DELIVERY ADDRESS", {
    x,
    y: cursor,
    size: 7,
    font: bold,
    color: colors.primary,
  });
  cursor -= 16;

  const addressLines = [
    address.address_line1,
    address.address_line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    countryName(address.country),
  ]
    .filter(Boolean)
    .flatMap((line) => wrapText(line, regular, 8.5, width));

  if (addressLines.length === 0) {
    addressLines.push("Address not provided");
  }

  for (const line of addressLines) {
    cursor = drawText(page, line, {
      x,
      y: cursor,
      size: 8.5,
      font: regular,
      color: colors.ink,
    });
    cursor -= 11;
  }

  return cursor;
}

function drawTableHeader(page, { y, bold }) {
  const height = 25;

  page.drawRectangle({
    x: MARGIN,
    y: y - height,
    width: CONTENT_WIDTH,
    height,
    color: colors.ink,
  });

  drawText(page, "ITEM DESCRIPTION", {
    x: MARGIN + 10,
    y: y - 9,
    size: 7,
    font: bold,
    color: colors.white,
  });
  drawText(page, "QTY", {
    x: MARGIN + 300,
    y: y - 9,
    size: 7,
    font: bold,
    color: colors.white,
  });
  drawText(page, "UNIT PRICE", {
    y: y - 9,
    size: 7,
    font: bold,
    color: colors.white,
    align: "right",
    right: MARGIN + 438,
  });
  drawText(page, "AMOUNT", {
    y: y - 9,
    size: 7,
    font: bold,
    color: colors.white,
    align: "right",
    right: MARGIN + CONTENT_WIDTH - 10,
  });

  return y - height;
}

function drawItemRow(page, { item, index, y, regular, bold }) {
  const titleLines = wrapText(item.title || "Product", bold, 9, 270);
  const meta = [item.variant_label, item.sku ? `SKU ${item.sku}` : ""]
    .filter(Boolean)
    .join("  |  ");
  const metaLines = meta ? wrapText(meta, regular, 7.5, 270) : [];
  const height = Math.max(
    34,
    12 + titleLines.length * 11 + metaLines.length * 10 + 8,
  );

  if (index % 2 === 0) {
    page.drawRectangle({
      x: MARGIN,
      y: y - height,
      width: CONTENT_WIDTH,
      height,
      color: colors.surface,
    });
  }

  let cursor = y - 12;

  for (const line of titleLines) {
    drawText(page, line, {
      x: MARGIN + 10,
      y: cursor,
      size: 9,
      font: bold,
    });
    cursor -= 11;
  }

  for (const line of metaLines) {
    drawText(page, line, {
      x: MARGIN + 10,
      y: cursor,
      size: 7.5,
      font: regular,
      color: colors.slate,
    });
    cursor -= 10;
  }

  drawText(page, String(item.quantity ?? 0), {
    x: MARGIN + 300,
    y: y - 12,
    size: 8.5,
    font: regular,
  });
  drawText(page, money(item.unit_price), {
    y: y - 12,
    size: 8.5,
    font: regular,
    align: "right",
    right: MARGIN + 438,
  });
  drawText(page, money(item.line_total), {
    y: y - 12,
    size: 8.5,
    font: bold,
    align: "right",
    right: MARGIN + CONTENT_WIDTH - 10,
  });

  page.drawLine({
    start: { x: MARGIN, y: y - height },
    end: { x: MARGIN + CONTENT_WIDTH, y: y - height },
    thickness: 0.6,
    color: colors.border,
  });

  return y - height;
}

function drawTotals(page, { order, y, bold, regular }) {
  const boxWidth = 235;
  const boxX = PAGE_WIDTH - MARGIN - boxWidth;
  const rows = [
    ["Subtotal", money(order.subtotal)],
    [
      "Shipping",
      Number(order.shipping_fee) === 0 ? "Free" : money(order.shipping_fee),
    ],
    ["Tax", money(order.tax)],
  ];

  if (Number(order.discount) > 0) {
    rows.push([
      `Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`,
      `-${money(order.discount)}`,
    ]);
  }

  let cursor = y;

  for (const [label, value] of rows) {
    drawText(page, label, {
      x: boxX,
      y: cursor,
      size: 8.5,
      font: regular,
      color: colors.slate,
    });
    drawText(page, value, {
      y: cursor,
      size: 8.5,
      font: regular,
      align: "right",
      right: PAGE_WIDTH - MARGIN,
    });
    cursor -= 17;
  }

  page.drawLine({
    start: { x: boxX, y: cursor + 2 },
    end: { x: PAGE_WIDTH - MARGIN, y: cursor + 2 },
    thickness: 0.8,
    color: colors.border,
  });

  cursor -= 14;
  drawText(page, "TOTAL", {
    x: boxX,
    y: cursor,
    size: 9,
    font: bold,
  });
  drawText(page, money(order.total), {
    y: cursor,
    size: 14,
    font: bold,
    align: "right",
    right: PAGE_WIDTH - MARGIN,
  });
  cursor -= 25;

  const dueLabel =
    order.payment_status === "paid"
      ? "PAID IN FULL"
      : order.payment_status === "refunded"
        ? "REFUNDED"
        : order.payment_method === "cod"
          ? "AMOUNT DUE ON DELIVERY"
          : "AMOUNT DUE";

  page.drawRectangle({
    x: boxX,
    y: cursor - 35,
    width: boxWidth,
    height: 35,
    color: colors.greenSoft,
    borderColor: colors.green,
    borderWidth: 0.6,
  });
  drawText(page, dueLabel, {
    x: boxX + 9,
    y: cursor - 11,
    size: 6.5,
    font: bold,
    color: colors.green,
  });
  drawText(page, money(order.total), {
    y: cursor - 12,
    size: 12,
    font: bold,
    color: colors.green,
    align: "right",
    right: PAGE_WIDTH - MARGIN - 9,
  });

  return cursor - 44;
}

function drawNotes(page, { order, y, bold, regular }) {
  let cursor = y;

  if (order.customer_note) {
    drawText(page, "CUSTOMER NOTE", {
      x: MARGIN,
      y: cursor,
      size: 7,
      font: bold,
      color: colors.primary,
    });
    cursor -= 15;

    for (const line of wrapText(order.customer_note, regular, 8.5, CONTENT_WIDTH - 10)) {
      cursor = drawText(page, line, {
        x: MARGIN,
        y: cursor,
        size: 8.5,
        font: regular,
        color: colors.slate,
      });
      cursor -= 11;
    }

    cursor -= 8;
  }

  if (order.tracking_number || order.courier) {
    const parts = [];

    if (order.courier) parts.push(`Courier: ${order.courier}`);
    if (order.tracking_number) parts.push(`Tracking: ${order.tracking_number}`);

    drawText(page, parts.join("  |  "), {
      x: MARGIN,
      y: cursor,
      size: 8,
      font: regular,
      color: colors.slate,
    });
    cursor -= 16;
  }

  return cursor;
}

function drawFooter(page, { order, copyLabel, pageNumber, totalPages, regular }) {
  page.drawLine({
    start: { x: MARGIN, y: 42 },
    end: { x: PAGE_WIDTH - MARGIN, y: 42 },
    thickness: 0.6,
    color: colors.border,
  });

  drawText(page, "Thank you for shopping with SM Store.", {
    x: MARGIN,
    y: 30,
    size: 7.5,
    font: regular,
    color: colors.slate,
  });
  drawText(page, "smstoreweb.vercel.app", {
    y: 30,
    size: 7.5,
    font: regular,
    color: colors.slate,
    align: "right",
    right: PAGE_WIDTH - MARGIN - 58,
  });
  drawText(page, `Page ${pageNumber} of ${totalPages}`, {
    y: 30,
    size: 7.5,
    font: regular,
    color: colors.muted,
    align: "right",
    right: PAGE_WIDTH - MARGIN,
  });
  drawText(page, `${copyLabel}  |  Order ${order.order_number || ""}`, {
    x: MARGIN,
    y: 20,
    size: 6.5,
    font: regular,
    color: colors.muted,
  });
}

function drawSignatureBlock(page, { y, bold, regular }) {
  const cursor = Math.max(y, 92);

  page.drawLine({
    start: { x: MARGIN, y: cursor },
    end: { x: MARGIN + 190, y: cursor },
    thickness: 0.8,
    color: colors.slate,
  });
  drawText(page, "Packed by", {
    x: MARGIN,
    y: cursor - 12,
    size: 7.5,
    font: regular,
    color: colors.slate,
  });

  page.drawLine({
    start: { x: PAGE_WIDTH - MARGIN - 210, y: cursor },
    end: { x: PAGE_WIDTH - MARGIN, y: cursor },
    thickness: 0.8,
    color: colors.slate,
  });
  drawText(page, "Received by / Rider signature", {
    y: cursor - 12,
    size: 7.5,
    font: regular,
    color: colors.slate,
    align: "right",
  });
  drawText(page, "Customer signature", {
    y: cursor - 23,
    size: 6.5,
    font: bold,
    color: colors.muted,
    align: "right",
  });
}

export async function createOrderInvoicePdf(
  order,
  { copyLabel = "CUSTOMER COPY" } = {},
) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = [];

  pdf.setTitle(`Invoice ${order.order_number || ""}`.trim());
  pdf.setAuthor("SM Store");
  pdf.setSubject("SM Store order invoice");
  pdf.setCreator("SM Store");
  pdf.setProducer("SM Store");
  const items = order.items ?? order.order_items ?? [];
  const address = order.shipping_address ?? {};
  const customerName =
    address.full_name || order.customer_name || "Customer";
  const customerPhone = address.phone || "";

  function addPage(firstPage = false) {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);

    return {
      page,
      y: drawHeader(page, {
        order,
        firstPage,
        regular,
        bold,
      }),
    };
  }

  let current = addPage(true);

  current.y = drawMetaBar(current.page, {
    order,
    y: current.y,
    bold,
  });

  current.y = drawCustomerBlock(current.page, {
    x: MARGIN,
    y: current.y,
    width: CONTENT_WIDTH,
    name: customerName,
    phone: customerPhone,
    address,
    bold,
    regular,
  });
  current.y -= 16;
  current.y = drawTableHeader(current.page, { y: current.y, bold });

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const titleLines = wrapText(item.title || "Product", bold, 9, 270);
    const meta = [item.variant_label, item.sku ? `SKU ${item.sku}` : ""]
      .filter(Boolean)
      .join("  |  ");
    const metaLines = meta ? wrapText(meta, regular, 7.5, 270) : [];
    const estimatedHeight =
      Math.max(34, 12 + titleLines.length * 11 + metaLines.length * 10 + 8) + 18;

    if (current.y - estimatedHeight < 96) {
      current = addPage(false);
      current.y = drawTableHeader(current.page, {
        y: current.y,
        bold,
      });
    }

    current.y = drawItemRow(current.page, {
      item,
      index,
      y: current.y,
      regular,
      bold,
    });
  }

  if (current.y - 180 < 96) {
    current = addPage(false);
  }

  current.y = drawTotals(current.page, {
    order,
    y: current.y - 14,
    bold,
    regular,
  });

  current.y = drawNotes(current.page, {
    order,
    y: current.y - 14,
    bold,
    regular,
  });

  if (current.y < 150) {
    current = addPage(false);
  }

  drawSignatureBlock(current.page, {
    y: Math.min(current.y - 20, 112),
    bold,
    regular,
  });

  pages.forEach((page, index) => {
    drawFooter(page, {
      order,
      copyLabel,
      pageNumber: index + 1,
      totalPages: pages.length,
      regular,
    });
  });

  return pdf.save();
}
