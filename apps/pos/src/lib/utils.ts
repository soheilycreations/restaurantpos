/**
 * Formats a number as a currency string with thousands separators and 2 decimal places.
 * Example: 56650 -> "56,650.00"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
