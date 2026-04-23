/**
 * Normalizes a phone number to a consistent 0XXXXXXXXXX format
 * for flexible matching regardless of how the number was entered.
 *
 * Handles: 085xxx, 62085xxx, +6285xxx, 8xxx (missing leading zero),
 *          numbers with spaces/dashes/dots/parentheses/plus signs.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return ""

  // Remove all non-digit characters (spaces, dashes, dots, parentheses, +)
  let cleaned = phone.replace(/[\s\-\.\(\)\+]/g, "")

  // Remove country code 62 -> 0
  if (cleaned.startsWith("62") && cleaned.length > 10) {
    cleaned = "0" + cleaned.slice(2)
  }

  // If number doesn't start with 0 and looks like a valid mobile number (8xxx...)
  if (!cleaned.startsWith("0") && cleaned.length >= 9 && cleaned.startsWith("8")) {
    cleaned = "0" + cleaned
  }

  return cleaned
}

/**
 * Checks whether two phone numbers refer to the same subscriber
 * by normalizing both before comparing.
 */
export function phonesMatch(a: string, b: string): boolean {
  if (!a || !b) return false
  return normalizePhone(a) === normalizePhone(b)
}
