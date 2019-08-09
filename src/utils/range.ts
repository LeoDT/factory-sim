export function range(start: number, end?: number, step: number = 1): number[] {
  let s = start,
    e = end;

  if (e === undefined) {
    e = s;
    s = 0;
  }

  const length = Math.ceil((e - s) / step);
  const arr = new Array(length);
  let i = 0;

  while (s < e) {
    arr[i] = s;
    s += step;
    i += 1;
  }

  return arr;
}
