export function clamp(n: number, min: number, max: number = Infinity): number {
  if (n < min) {
    return min;
  }

  if (n > max) {
    return max;
  }

  return n;
}
