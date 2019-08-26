export function addVector2(a: Vector2, b: Vector2): Vector2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function subVector2(a: Vector2, b: Vector2): Vector2 {
  return [a[0] - b[0], a[1] - b[1]];
}

export function sameVector2(a: Vector2, b: Vector2): boolean {
  return a[0] === b[0] && a[1] === b[1];
}
