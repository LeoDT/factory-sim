export function transformTranslate(el: HTMLElement, pos: Vector2, multiplier: 1 | -1 = 1): void {
  el.style.transform = `translate3d(${pos[0] * multiplier}px, ${pos[1] * multiplier}px, 0)`;
}
