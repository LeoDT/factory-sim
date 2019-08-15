export function getTopCenterXY(el: HTMLElement): Vector2 {
  const rect = el.getBoundingClientRect();

  return [rect.left + rect.width / 2, rect.top];
}

export function getCenterCenterXY(el: HTMLElement): Vector2 {
  const rect = el.getBoundingClientRect();

  return [rect.left + rect.width / 2, rect.top + rect.height / 2];
}
