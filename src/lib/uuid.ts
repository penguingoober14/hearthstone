let counter = 0;

/**
 * Generate a unique ID that's safe from collision.
 * Uses timestamp + counter + random component for uniqueness.
 */
export function generateId(prefix: string = ''): string {
  counter = (counter + 1) % 1000000;
  const timestamp = Date.now().toString(36);
  const count = counter.toString(36).padStart(4, '0');
  const random = Math.random().toString(36).substr(2, 6);
  return prefix ? `${prefix}_${timestamp}${count}${random}` : `${timestamp}${count}${random}`;
}
