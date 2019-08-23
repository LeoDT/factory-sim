import { observable } from 'mobx';

import { windowResize } from '~utils/observables';

import { Storage } from '~core/storage';
import { Node } from '~core/node';
import { Port } from '~core/port';
import { Board } from '~core/board';

type Selectable = Node | Storage | Board;

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

  public linkStartPort = observable.box<Port | null>(null, { deep: false });
}
