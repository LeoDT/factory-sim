export function transformTranslate(el: HTMLElement, pos: Vector2): void {
  el.style.transform = `translate3d(${pos[0]}px, ${pos[1]}px, 0)`;
}
