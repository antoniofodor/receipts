export const normaliseEmail = (email: string) => email.trim().toLowerCase();

// Enough to catch a typo before sending a code; the email itself is the real check.
export const looksLikeEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normaliseEmail(email));
