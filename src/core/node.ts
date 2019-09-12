import { observable, IObservableObject } from 'mobx';

import { nodeData, NodeTypeJSON } from '~/data/nodeType';
import { generateShortId } from '~utils/shortid';
import { sendToGlobals } from '~utils/debug';

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
import { TileGroup, makeTileGroup, TileShape } from './tile';
import { LAYERS } from './layer';
import { randomBlokusShape, BlokusBlockAmount } from './blokus';
import { BoardType, boardTypes } from './board';

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
  shape: BlokusBlockAmount | TileShape;
  color: string;
  workOnBoard: BoardType;
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
    const workOnBoard = boardTypes.get(more.workOnBoardId);

    if (!workOnBoard) {
      throw new Error(`Unknown board id: ${more.workOnBoardId}`);
    }

    const nodeType: NodeType = {
      ...more,
      _type: 'NodeType',
      resourceRequirements: (resourceRequirements || []).map(({ resourceTypeId, amount }) =>
        makeResourceWithTypeId(resourceTypeId, amount)
      ),
      output: mappedOutput,
      resourcesForRun: getRequiredResourcesForResources(mappedOutput),
      workOnBoard
    };

    nodeTypes.set(nodeType.id, nodeType);
  });

  console.debug('loaded node types', nodeTypes);
}

export function getNodeTypeById(nodeTypeId: number): NodeType | undefined {
  return nodeTypes.get(nodeTypeId);
}

export function makeNode(nodeType: NodeType, tile: Vector2, id: string = generateShortId()): Node {
  const { resourcesForRun } = nodeType;
  const outSlots = nodeType.output.map(r => makeSlot([r.resourceType], undefined, r.amount));
  const storageSlots = resourcesForRun.map(r =>
    makeSlot([r.resourceType], undefined, r.amount * NODE_STORAGE_MULTIPLIER)
  );
  const shape =
    typeof nodeType.shape === 'number' ? randomBlokusShape(nodeType.shape) : nodeType.shape;

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
      tileGroup: makeTileGroup(tile, shape, true, LAYERS.node)
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

export function makeAndStartNode(nodeType: NodeType, tile: Vector2, id?: string): Node {
  const node = makeNode(nodeType, tile, id);

  runClock.subscribe(() => {
    runNode(node);
  });

  return node;
}
