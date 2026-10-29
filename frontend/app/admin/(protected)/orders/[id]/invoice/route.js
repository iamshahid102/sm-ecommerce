import { NextResponse } from "next/server";

import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, getSessionProfile } from "@/lib/auth/dal";
import { createOrderInvoicePdf } from "@/lib/invoices/order-invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function invoiceFilename(orderNumber) {
  const safeOrderNumber = String(orderNumber || "order").replace(
    /[^a-z0-9-]+/gi,
    "-",
  );

  return `store-invoice-${safeOrderNumber}.pdf`;
}

export async function GET(_request, { params }) {
  const { id } = await params;
  const session = await getSessionProfile();

  if (!session.claims) {
    return NextResponse.json(
      { error: "Please sign in to open this invoice." },
      { status: 401 },
    );
  }

  if (
    !session.profile ||
    session.profile.is_blocked ||
    session.profile.role !== "admin"
  ) {
    return NextResponse.json(
      { error: "Administrator access is required." },
      { status: 403 },
    );
  }

  const token = await getAccessToken(session.supabase);

  if (!token) {
    return NextResponse.json(
      { error: "Your session has expired. Please sign in again." },
      { status: 401 },
    );
  }

  let order;

  try {
    order = await apiFetchServer(`/admin/orders/${id}`, { token });
  } catch (error) {
    if (error.status === 404) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(
      { error: "The invoice could not be prepared. Please try again." },
      { status: error.status >= 400 && error.status < 500 ? error.status : 502 },
    );
  }

  const pdf = await createOrderInvoicePdf(order, {
    copyLabel: "STORE COPY",
  });

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoiceFilename(
        order.order_number,
      )}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
