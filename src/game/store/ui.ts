import { observable } from 'mobx';

import { windowResize } from '~utils/observables';

import { Storage } from '~core/storage';
import { Node } from '~core/node';

type Selectable = Node | Storage;

export default class UI {
  public windowResize = windowResize();

  public selected = observable.box<Selectable | null>(null, { deep: false });
  public selectedEl: Element | null = null;

  public select(s: Selectable, el: Element): void {
    this.selected.set(s);
    this.selectedEl = el;
  }

  public unselect(): void {
    this.selected.set(null);
    this.selectedEl = null;
  }
}
