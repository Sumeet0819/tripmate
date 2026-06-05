/**
 * Converts a hex color string to rgba format.
 * Matches 3-digit and 6-digit hex values.
 *
 * @param hex - Hex color code (e.g. "#FF6B35" or "FF6B35")
 * @param alpha - Opacity value between 0 and 1
 */
export function hexToRgba(hex: string, alpha: number): string {
  let cleaned = hex.replace("#", "");

  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (cleaned.length !== 6) {
    return hex; // fallback to original
  }

  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
