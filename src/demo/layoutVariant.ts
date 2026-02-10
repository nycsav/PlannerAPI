export type LayoutVariant = 'A' | 'B';

const KEY = 'layoutVariant';

export function getLayoutVariant(): LayoutVariant {
  if (typeof window === 'undefined') return 'A';
  const value = window.localStorage.getItem(KEY);
  return value === 'B' ? 'B' : 'A';
}

export function setLayoutVariant(v: LayoutVariant): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, v);
}
