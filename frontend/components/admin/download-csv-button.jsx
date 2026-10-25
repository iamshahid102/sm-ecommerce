"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiDownload } from "@/lib/api/client";

export function DownloadCsvButton({ path, filename, label = "Export CSV" }) {
  const [pending, setPending] = useState(false);

  async function download() {
    setPending(true);
    try {
      await apiDownload(path, filename);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={download} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}
