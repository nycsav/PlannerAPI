import { Response } from 'express';

/**
 * Sets standard CORS headers on the response.
 * Replaces 17 identical 3-line blocks across 9 files.
 */
export function setCorsHeaders(
  res: Response,
  methods: string = 'POST, OPTIONS',
  headers: string = 'Content-Type',
): void {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', methods);
  res.set('Access-Control-Allow-Headers', headers);
}

/**
 * Handles OPTIONS preflight request. Returns true if handled (caller should return early).
 */
export function handlePreflight(req: { method: string }, res: Response): boolean {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  return false;
}
