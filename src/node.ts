import { observable, IObservableObject } from 'mobx';
import { nodeData, NodeTypeJSON } from '~/data/nodeType';

import { globalClock } from './observables';

import {
  Resource,
  makeResourceWithTypeId,
  getRequiredResourcesForResources,
  makeResource
} from './resource';
import {
  Slot,
  makeSlot,
  slotCanAcceptResource,
  takeResourceOutSlot,
  putResourceInSlot,
  slotCanAffordResource
} from './slot';
import { generateShortId } from '~utils/shortid';

// node can store resources needed for NODE_STORAGE_MULTIPLIER output
const NODE_STORAGE_MULTIPLIER = 5;

export interface NodeType {
  id: number;
  name: string;
  resourceRequirements: Resource[];
  output: Resource[];
  cycle: number;
}

export interface Node extends IObservableObject {
  nodeType: NodeType;
  id: string;

  // n slots, n = output length
  outSlots: Slot[];
  // n slots, n = all output's unique requirements length,
  storage: Slot[];

  currentCycle: number;
}

const nodeTypes = new Map<number, NodeType>();

export function loadNodeTypes(): void {
  const json: NodeTypeJSON = JSON.parse(nodeData);

  json.forEach(({ resourceRequirements, output, ...more }) => {
    const nodeType: NodeType = {
      ...more,
      resourceRequirements: (resourceRequirements || []).map(({ resourceTypeId, amount }) =>
        makeResourceWithTypeId(resourceTypeId, amount)
      ),
      output: (output || []).map(({ resourceTypeId, amount = 1 }) =>
        makeResourceWithTypeId(resourceTypeId, amount)
      )
    };

    nodeTypes.set(nodeType.id, nodeType);
  });

  console.debug('loaded node types', nodeTypes);
}

export function getNodeTypeById(nodeTypeId: number): NodeType | undefined {
  return nodeTypes.get(nodeTypeId);
}

export function makeNode(nodeType: NodeType, id: string = generateShortId()): Node {
  const resourcesForProduce = getRequiredResourcesForResources(nodeType.output);

  const node = observable.object(
    {
      nodeType,
      id,

      outSlots: nodeType.output.map(r => makeSlot([r.resourceType], r.amount)),
      storage: resourcesForProduce.map(r =>
        makeSlot([r.resourceType], r.amount * NODE_STORAGE_MULTIPLIER)
      ),

      currentCycle: 0
    },
    {},
    { deep: false }
  );

  return node;
}

export function findStorageSlotForResource(node: Node, resource: Resource): Slot | undefined {
  return node.storage.find(s => s.resourceTypes.indexOf(resource.resourceType) !== -1);
}

export function runNode(node: Node): void {
  // product
  const requiredResources = getRequiredResourcesForResources(node.nodeType.output);
  const enoughResources = requiredResources.every(r => {
    const storage = findStorageSlotForResource(node, r);
    return storage && slotCanAffordResource(storage, r);
  });
  const enoughOutputSlots = node.outSlots.every(s => !s.resource);

  if (enoughResources && node.currentCycle === 0) {
    requiredResources.forEach(r => {
      const slot = findStorageSlotForResource(node, r);

      if (slot) {
        takeResourceOutSlot(slot, r);
      }
    });
    node.currentCycle += 1;
  } else if (node.currentCycle === node.nodeType.cycle - 1) {
    if (enoughOutputSlots) {
      const outputResources = node.nodeType.output.map(r => makeResource(r.resourceType, r.amount));

      outputResources.forEach(r => {
        const slot = node.outSlots.find(s => slotCanAcceptResource(s, r));

        if (slot) {
          putResourceInSlot(slot, r);
        }
      });
      node.currentCycle = 0;
    }
  } else if (node.currentCycle > 0) {
    node.currentCycle += 1;
  }
}

export function makeAndStartNode(nodeType: NodeType): Node {
  const node = makeNode(nodeType);

  globalClock.subscribe(() => {
    runNode(node);
  });

  return node;
}
