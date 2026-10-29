export const NAVIGATION_START_EVENT = "sm:navigation-start";

export function startNavigation() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}
