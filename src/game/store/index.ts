import { observable } from 'mobx';

import { NodeType, Node, makeAndStartNode } from '~core/node';
import { Link, makeAndStartLink } from '~core/link';
import { Storage, makeStorage, StorageType } from '~core/storage';
import { Port } from '~core/port';

import UI from './ui';

export class Store {
  public ui = new UI();

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
