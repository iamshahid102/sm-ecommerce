import { AlertTriangle, Search } from "lucide-react";

import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { MessageReadButton } from "@/components/admin/message-read-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetchServerFull } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q || "";
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page || "1";

  let payload = null;
  let error = null;

  try {
    payload = await apiFetchServerFull(
      `/admin/messages?q=${encodeURIComponent(q)}&page=${page}&limit=20`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const messages = payload?.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact messages"
        description="Read enquiries submitted through the storefront contact form."
      />

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-4">
          <form className="flex gap-2" action="/admin/messages">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search name, email, or subject"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Messages could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && messages.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <p className="font-heading text-lg font-semibold">No messages</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact form submissions will appear here.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={cn(
              "rounded-2xl shadow-none",
              !message.is_read && "border-primary/40 bg-secondary/20",
            )}
          >
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{message.subject}</p>
                    <Badge
                      variant="outline"
                      className={
                        message.is_read
                          ? "border-slate-200 bg-slate-50 text-slate-600"
                          : "border-primary/30 bg-primary/10 text-primary"
                      }
                    >
                      {message.is_read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {message.name} ·{" "}
                    <a href={`mailto:${message.email}`} className="hover:text-foreground">
                      {message.email}
                    </a>
                    {message.phone ? ` · ${message.phone}` : ""} ·{" "}
                    {formatDate(message.created_at)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <MessageReadButton
                    messageId={message.id}
                    isRead={message.is_read}
                  />
                  <AdminDeleteButton
                    endpoint={`/admin/messages/${message.id}`}
                    confirmText="Delete this message permanently?"
                  />
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {message.message}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length > 0 ? (
        <AdminPagination
          meta={payload.meta}
          basePath="/admin/messages"
          params={{ q }}
        />
      ) : null}
    </div>
  );
}
