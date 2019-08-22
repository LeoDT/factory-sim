import { observable, IObservableObject } from 'mobx';

import { nodeData, NodeTypeJSON } from '~/data/nodeType';
import { generateShortId } from '~utils/shortid';

import { runClock } from './clocks';

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
import { TileArea, TileGroup, makeTileGroup, TileShape } from './tile';
import { sendToGlobals } from '~utils/debug';

// node can store resources needed for NODE_STORAGE_MULTIPLIER output
const NODE_STORAGE_MULTIPLIER = 5;

export interface NodeType {
  _type: 'NodeType';

  id: number;
  name: string;
  resourceRequirements: Resource[];
  resourcesForRun: Resource[];
  output: Resource[];
  cycle: number;
  tiles: TileArea[];
  shape: TileShape;
}

export interface Node extends IObservableObject {
  _type: 'Node';

  nodeType: NodeType;
  id: string;

  inPort: Port;
  outPort: Port;
  // n slots, n = output length
  outSlots: Slot[];
  // n slots, n = all output's unique requirements length,
  storageSlots: Slot[];

  cycler: Cycler;
  tileGroup: TileGroup;
}

export const nodeTypes = new Map<number, NodeType>();

sendToGlobals({ nodeTypes });

export function loadNodeTypes(): void {
  const json: NodeTypeJSON = JSON.parse(nodeData);

  json.forEach(({ resourceRequirements, output, ...more }) => {
    const mappedOutput = (output || []).map(({ resourceTypeId, amount = 1 }) =>
      makeResourceWithTypeId(resourceTypeId, amount)
    );

    const nodeType: NodeType = {
      ...more,
      _type: 'NodeType',
      resourceRequirements: (resourceRequirements || []).map(({ resourceTypeId, amount }) =>
        makeResourceWithTypeId(resourceTypeId, amount)
      ),
      output: mappedOutput,
      resourcesForRun: getRequiredResourcesForResources(mappedOutput)
    };

    nodeTypes.set(nodeType.id, nodeType);
  });

  console.debug('loaded node types', nodeTypes);
}

export function getNodeTypeById(nodeTypeId: number): NodeType | undefined {
  return nodeTypes.get(nodeTypeId);
}

export function makeNode(nodeType: NodeType, id: string = generateShortId()): Node {
  const { resourcesForRun } = nodeType;
  const outSlots = nodeType.output.map(r => makeSlot([r.resourceType], r.amount));
  const storageSlots = resourcesForRun.map(r =>
    makeSlot([r.resourceType], r.amount * NODE_STORAGE_MULTIPLIER)
  );

  return observable.object(
    {
      _type: 'Node',
      nodeType,
      id,

      inPort: makePort(storageSlots),
      outPort: makePort(outSlots),

      outSlots,
      storageSlots,

      cycler: makeCycler(nodeType.cycle),
      tileGroup: makeTileGroup([0, 0], nodeType.shape)
    },
    {},
    { deep: false }
  );
}

export function findStorageSlotForResource(node: Node, resource: Resource): Slot | undefined {
  return node.storageSlots.find(s => s.resourceTypes.indexOf(resource.resourceType) !== -1);
}

export function runNode(node: Node): void {
  switch (node.cycler.state) {
    case 'IDLE':
      const { resourcesForRun } = node.nodeType;
      const enoughResources = resourcesForRun.every(r => {
        const storage = findStorageSlotForResource(node, r);
        return storage && slotCanAffordResource(storage, r);
      });

      if (enoughResources) {
        resourcesForRun.forEach(r => {
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

  runClock.subscribe(() => {
    runNode(node);
  });

  return node;
}
