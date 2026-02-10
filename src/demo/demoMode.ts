function parseDemoMode(value: string | undefined): boolean {
  if (value === undefined) return true;
  const normalized = value.toLowerCase().trim();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

export const isDemoMode = parseDemoMode(import.meta.env.VITE_DEMO_MODE);
