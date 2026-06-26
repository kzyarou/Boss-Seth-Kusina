/**
 * Input sanitization utilities
 *
 * SECURITY NOTE: These are CLIENT-SIDE mitigations only. Real protection requires
 * server-side validation + sanitization. An attacker can bypass these by editing
 * the code or calling APIs directly. Use these as UX guards + defense-in-depth.
 */

/**
 * Sanitize text input: strip HTML tags, limit length, trim whitespace
 */
export function sanitizeText(input: string, maxLen: number = 500): string {
  if (!input) return '';

  // Strip all HTML tags (basic protection against XSS)
  let clean = input.replace(/<[^>]*>/g, '');

  // Remove potentially dangerous characters
  clean = clean.replace(/[<>]/g, '');

  // Trim whitespace
  clean = clean.trim();

  // Enforce max length
  if (clean.length > maxLen) {
    clean = clean.substring(0, maxLen);
  }

  return clean;
}

/**
 * Sanitize an array of strings (e.g. ingredients, steps)
 */
export function sanitizeArray(items: string[], maxLen: number = 200): string[] {
  return items.
  map((item) => sanitizeText(item, maxLen)).
  filter((item) => item.length > 0) // Remove empty strings
  .slice(0, 50); // Max 50 items to prevent abuse
}

/**
 * Validate email format (basic regex check)
 * NOTE: This does NOT verify the email exists or is deliverable.
 * Real verification requires sending a code via a backend email service.
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim().toLowerCase());
}

/**
 * Validate phone number format (basic check for 7-15 digits)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+?\d{7,15})$/.test(cleaned);
}