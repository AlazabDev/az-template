// Browser-only auth storage. Server rendering intentionally has no storage.
export function browserAuthStorage() {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage;
}
