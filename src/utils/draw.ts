export function getTopCenterXY(el: HTMLElement): [number, number] {
  return [el.offsetLeft + el.offsetWidth / 2, el.offsetTop];
}

export function getCenterCenterXY(el: HTMLElement): [number, number] {
  return [el.offsetLeft + el.offsetWidth / 2, el.offsetTop + el.offsetHeight / 2];
}
