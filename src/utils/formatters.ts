/**
 * Formats a number as Indian Rupee currency string.
 * Example: 249 → "₹249.00"
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Formats prep time to a human-readable form.
 * Accepts a string (e.g., "25 mins", "1 hour") or a number of minutes.
 * If a number is provided, converts to a readable format.
 */
export function formatTime(time: string | number): string {
  if (typeof time === 'string') {
    return time;
  }

  if (time < 60) {
    return `${time} min${time !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  if (minutes === 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
}
