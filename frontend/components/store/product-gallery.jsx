"use client";

import { useState } from "react";

import { StoreImage } from "@/components/store/store-image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images = [], title }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border bg-muted">
        <StoreImage
          src={current?.url}
          alt={current?.alt_text || title}
          priority
          className="h-full w-full"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id ?? image.url}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border bg-muted",
                index === active && "ring-2 ring-primary ring-offset-2",
              )}
              aria-label={`View image ${index + 1}`}
            >
              <StoreImage
                src={image.url}
                alt={image.alt_text || `${title} image ${index + 1}`}
                sizes="120px"
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
