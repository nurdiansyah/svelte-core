// for SSR
export function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
