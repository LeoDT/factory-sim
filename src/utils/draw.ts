export function getTopCenterXY(el: HTMLElement): [number, number] {
  const rect = el.getBoundingClientRect();

  return [rect.left + rect.width / 2, rect.top];
}

export function getCenterCenterXY(el: HTMLElement): [number, number] {
  const rect = el.getBoundingClientRect();

  return [rect.left + rect.width / 2, rect.top + rect.height / 2];
}
