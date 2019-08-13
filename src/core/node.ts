import { observable, IObservableObject } from 'mobx';

import { nodeData, NodeTypeJSON } from '~/data/nodeType';
import { generateShortId } from '~utils/shortid';

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
import { makePort, Port } from './port';
import { Cycler, makeCycler } from './cycler';

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

  inPort: Port;
  outPort: Port;
  // n slots, n = output length
  outSlots: Slot[];
  // n slots, n = all output's unique requirements length,
  storageSlots: Slot[];

  cycler: Cycler;
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
  const outSlots = nodeType.output.map(r => makeSlot([r.resourceType], r.amount));
  const storageSlots = resourcesForProduce.map(r =>
    makeSlot([r.resourceType], r.amount * NODE_STORAGE_MULTIPLIER)
  );

  const node = observable.object(
    {
      nodeType,
      id,

      inPort: makePort(storageSlots),
      outPort: makePort(outSlots),

      outSlots,
      storageSlots,

      cycler: makeCycler(nodeType.cycle)
    },
    {},
    { deep: false }
  );

  return node;
}

export function findStorageSlotForResource(node: Node, resource: Resource): Slot | undefined {
  return node.storageSlots.find(s => s.resourceTypes.indexOf(resource.resourceType) !== -1);
}

export function runNode(node: Node): void {
  switch (node.cycler.state) {
    case 'IDLE':
      const requiredResources = getRequiredResourcesForResources(node.nodeType.output);
      const enoughResources = requiredResources.every(r => {
        const storage = findStorageSlotForResource(node, r);
        return storage && slotCanAffordResource(storage, r);
      });

      if (enoughResources) {
        requiredResources.forEach(r => {
          const slot = findStorageSlotForResource(node, r);

          if (slot) {
            takeResourceOutSlot(slot, r);
          }
        });

        node.cycler.tick();
      }
      break;

    case 'FINISH':
      const enoughOutputSlots = node.outSlots.every(s => !s.resource);
      if (enoughOutputSlots) {
        const outputResources = node.nodeType.output.map(r =>
          makeResource(r.resourceType, r.amount)
        );

        outputResources.forEach(r => {
          const slot = node.outSlots.find(s => slotCanAcceptResource(s, r));

          if (slot) {
            putResourceInSlot(slot, r);
          }
        });

        node.cycler.tick();
      }
      break;
    default:
      node.cycler.tick();
      break;
  }
}

export function makeAndStartNode(nodeType: NodeType): Node {
  const node = makeNode(nodeType);

  globalClock.subscribe(() => {
    runNode(node);
  });

  return node;
}
