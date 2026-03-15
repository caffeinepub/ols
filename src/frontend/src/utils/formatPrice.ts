/**
 * Formats a price value as Indian Rupees with ₹ symbol and Indian numbering system
 * @param price - The price value as bigint or number
 * @returns Formatted price string (e.g., "₹1,999" or "₹1,00,000")
 */
export function formatPrice(price: bigint | number): string {
  const numPrice = typeof price === "bigint" ? Number(price) : price;

  // Use Indian numbering system (lakhs and crores)
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(numPrice);
}
