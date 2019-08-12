import { createContext, useContext } from 'react';
import { observable } from 'mobx';

import { NodeType, Node, makeAndStartNode, getNodeTypeById } from '~node';
import { Link, makeAndStartLink } from '~link';
import { Storage, makeStorage, StorageType, getStorageTypeById } from '~storage';
import { Slot } from '~slot';

class Store {
  public nodes = observable.array<Node>([], { deep: false });
  public links = observable.array<Link>([], { deep: false });
  public storages = observable.array<Storage>([], { deep: false });

  public addNode(nodeType: NodeType): Node {
    const node = makeAndStartNode(nodeType);

    this.nodes.push(node);

    return node;
  }

  public addLink(from: Slot, to: Slot): Link {
    const link = makeAndStartLink(from, to);

    this.links.push(link);

    return link;
  }

  public addStorage(storageType: StorageType): Storage {
    const storage = makeStorage(storageType);

    this.storages.push(storage);

    return storage;
  }

  public slotUIElements = observable.map<Slot, HTMLElement>(new Map<Slot, HTMLElement>(), {
    deep: false
  });

  public updateSlotUIElement(slot: Slot, e: HTMLElement): void {
    this.slotUIElements.set(slot, e);
  }
}

export const store = new Store();
export const StoreContext = createContext<Store>(store);

export function useStore(): Store {
  return useContext(StoreContext);
}

declare global {
  interface Window {
    store: Store;
  }
}
window.store = store;

export function mock(): void {
  const nodeType1 = getNodeTypeById(1);
  const nodeType2 = getNodeTypeById(2);
  const nodeType3 = getNodeTypeById(3);
  const storageType = getStorageTypeById(1);

  if (nodeType1 && nodeType2 && nodeType3 && storageType) {
    const node1 = store.addNode(nodeType1);
    const node2 = store.addNode(nodeType2);
    store.addLink(node1.outSlots[0], node2.storage[0]);
    const storage = store.addStorage(storageType);
    store.addLink(node2.outSlots[0], storage.slots[0]);

    const node3 = store.addNode(nodeType3);
    store.addLink(node1.outSlots[0], node3.storage[0]);
    store.addLink(storage.slots[0], node3.storage[1]);
    store.addLink(node3.outSlots[0], storage.slots[1]);
  }
}

module.hot.accept();
