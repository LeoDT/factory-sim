export function getTopCenterXY(el: HTMLElement): [number, number] {
  return [el.offsetLeft + el.offsetWidth / 2, el.offsetTop];
}
