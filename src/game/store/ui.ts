import { observable } from 'mobx';

import { windowResize } from '~utils/observables';

import { Storage } from '~core/storage';
import { Node } from '~core/node';
import { Port } from '~core/port';
import { Board } from '~core/board';
import { Slot } from '~core/slot';

type Selectable = Node | Storage | Board | Slot;
type Holdable = Node | Board;

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

  public holding = observable.box<Holdable | null>(null, { deep: false });

  public hold(h: Holdable): void {
    this.holding.set(h);
  }

  public unhold(): void {
    this.holding.set(null);
  }

  public linkStartPort = observable.box<Port | null>(null, { deep: false });
}
