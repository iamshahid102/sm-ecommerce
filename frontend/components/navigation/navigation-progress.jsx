"use client";

import { LoaderCircle, ShoppingBag } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { NAVIGATION_START_EVENT } from "@/lib/navigation-progress";

const OVERLAY_DELAY_MS = 180;
const SAFETY_TIMEOUT_MS = 15000;
const FADE_OUT_MS = 240;

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const activeRef = useRef(false);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const finish = useCallback(() => {
    if (!activeRef.current) return;

    activeRef.current = false;
    clearTimers();
    setProgress(100);
    setShowOverlay(false);

    schedule(() => {
      setVisible(false);
      setProgress(0);
    }, FADE_OUT_MS);
  }, [clearTimers, schedule]);

  const start = useCallback(() => {
    if (activeRef.current) return;

    activeRef.current = true;
    clearTimers();
    setVisible(true);
    setProgress(8);
    setShowOverlay(false);

    schedule(() => {
      if (!activeRef.current) return;
      setProgress(52);
      setShowOverlay(true);
    }, OVERLAY_DELAY_MS);

    schedule(() => {
      if (!activeRef.current) return;
      setProgress(72);
    }, 700);

    schedule(() => {
      if (!activeRef.current) return;
      setProgress(88);
    }, 1800);

    schedule(() => {
      if (activeRef.current) finish();
    }, SAFETY_TIMEOUT_MS);
  }, [clearTimers, finish, schedule]);

  useEffect(() => {
    if (activeRef.current) finish();
  }, [routeKey, finish]);

  useEffect(() => {
    function handleClick(event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target.closest?.("a[href]");

      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.noNavigationProgress !== undefined) return;

      const url = new URL(anchor.href, window.location.href);

      if (!["http:", "https:"].includes(url.protocol)) return;
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      start();
    }

    function handlePopState() {
      start();
    }

    function handleNavigationStart() {
      start();
    }

    function handleSubmit(event) {
      const form = event.target;

      if (
        form instanceof HTMLFormElement &&
        form.hasAttribute("data-navigation-form")
      ) {
        start();
      }
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener(NAVIGATION_START_EVENT, handleNavigationStart);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener(
        NAVIGATION_START_EVENT,
        handleNavigationStart,
      );
      clearTimers();
    };
  }, [clearTimers, start]);

  return (
    <>
      <div
        aria-hidden="true"
        data-navigation-progress-bar
        className={`pointer-events-none fixed inset-x-0 top-0 z-[210] h-[3px] bg-transparent transition-opacity duration-150 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-brand-deep via-primary to-brand-sky shadow-[0_0_12px_rgba(37,99,235,0.55)] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        aria-hidden={!showOverlay}
        data-navigation-progress-overlay
        className={`fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px] transition-opacity duration-200 ${
          showOverlay
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading page"
          className="flex w-full max-w-xs flex-col items-center rounded-3xl border border-white/70 bg-white/95 px-8 py-8 text-center shadow-[0_24px_80px_-20px_rgba(15,23,42,0.45)]"
        >
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
            <ShoppingBag className="size-7" aria-hidden="true" />
            <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
              <LoaderCircle
                className="size-4 animate-spin text-primary"
                aria-hidden="true"
              />
            </span>
          </div>

          <p className="mt-5 font-heading text-lg font-semibold tracking-tight text-slate-950">
            Loading...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Please wait a moment.
          </p>

          <div className="mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-slate-200">
            <div className="sm-loading-bar h-full w-1/2 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </>
  );
}
