import { loadResourceTypes } from './resource';
import { loadNodeTypes, getNodeTypeById, makeAndStartNode } from './node';
import { makeAndStartLink } from './link';
import { loadStorageTypes, makeStorage, getStorageTypeById } from './storage';

function init(): void {
  loadResourceTypes();
  loadNodeTypes();
  loadStorageTypes();

  const nodeType1 = getNodeTypeById(1);
  const nodeType2 = getNodeTypeById(2);
  const storageType = getStorageTypeById(1);

  if (nodeType1 && nodeType2 && storageType) {
    const node1 = makeAndStartNode(nodeType1);
    const node2 = makeAndStartNode(nodeType2);
    const link12 = makeAndStartLink(node1.outSlots[0], node2.storage[0]);
    const storage = makeStorage(storageType);
    const link2s = makeAndStartLink(node2.outSlots[0], storage.slots[0]);

    window.node1 = node1;
    window.node2 = node2;
    window.link12 = link12;
    window.link2s = link2s;
    window.storage = storage;
  }
}

init();
