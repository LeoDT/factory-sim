import { createContext, useContext } from 'react';
import { observable } from 'mobx';

import { NodeType, Node, makeAndStartNode, getNodeTypeById } from '~core/node';
import { Link, makeAndStartLink } from '~core/link';
import { Storage, makeStorage, StorageType, getStorageTypeById } from '~core/storage';
import { Port } from '~core/port';
import { sendToGlobals } from '~utils/debug';

class Store {
  public nodes = observable.array<Node>([], { deep: false });
  public links = observable.array<Link>([], { deep: false });
  public storages = observable.array<Storage>([], { deep: false });

  public addNode(nodeType: NodeType): Node {
    const node = makeAndStartNode(nodeType);

    this.nodes.push(node);

    return node;
  }

  public addLink(from: Port, to: Port): Link {
    const link = makeAndStartLink(from, to);

    this.links.push(link);

    return link;
  }

  public addStorage(storageType: StorageType): Storage {
    const storage = makeStorage(storageType);

    this.storages.push(storage);

    return storage;
  }

  public portUIElements = observable.map<Port, HTMLElement>(new Map<Port, HTMLElement>(), {
    deep: false
  });

  public updatePortUIElement(port: Port, e: HTMLElement): void {
    this.portUIElements.set(port, e);
  }
}

export const store = new Store();
export const StoreContext = createContext<Store>(store);

export function useStore(): Store {
  return useContext(StoreContext);
}

export function mock(): void {
  const nodeType1 = getNodeTypeById(1);
  const nodeType2 = getNodeTypeById(2);
  const nodeType3 = getNodeTypeById(3);
  const storageType = getStorageTypeById(1);

  if (nodeType1 && nodeType2 && nodeType3 && storageType) {
    const node1 = store.addNode(nodeType1);
    const node2 = store.addNode(nodeType2);
    const storage = store.addStorage(storageType);
    store.addLink(node1.outPort, storage.port);
    store.addLink(node2.outPort, storage.port);
    store.addLink(storage.port, node2.inPort);

    const node3 = store.addNode(nodeType3);
    store.addLink(storage.port, node3.inPort);
    store.addLink(node3.outPort, storage.port);
  }
}

module.hot.accept();

if (process.env.NODE_ENV === 'development') {
  sendToGlobals({ store });
}
