import { nodeData, NodeTypeJSON } from './data/nodeType';
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
  putResourceInSlot
} from './slot';

// node can store resources needed for NODE_STORAGE_MULTIPLIER output
const NODE_STORAGE_MULTIPLIER = 5;

export interface NodeType {
  id: number;
  name: string;
  resourceRequirements: Array<Resource>;
  output: Array<Resource>;
}

export interface Node {
  nodeType: NodeType;

  outSlots: Array<Slot>; // n slots, n = output length
  storage: Array<Slot>; // n slots, n = all output's unique requirements length,

  producing: boolean;
}

const nodeTypes = new Map<number, NodeType>();

export function loadNodeTypes() {
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

export function getNodeTypeById(nodeTypeId: number) {
  return nodeTypes.get(nodeTypeId);
}

export function makeNode(nodeType: NodeType): Node {
  const resourcesForProduce = getRequiredResourcesForResources(nodeType.output);

  const node = {
    nodeType,

    outSlots: nodeType.output.map(r => makeSlot([r.resourceType], r.amount)),
    storage: resourcesForProduce.map(r =>
      makeSlot([r.resourceType], r.amount * NODE_STORAGE_MULTIPLIER)
    ),

    producing: false
  };

  return node;
}

export function findStorageSlotForResource(node: Node, resource: Resource) {
  return node.storage.find(s => slotCanAcceptResource(s, resource));
}

export function runNode(node: Node) {
  // product
  const requiredResources = getRequiredResourcesForResources(node.nodeType.output);
  const enoughResources = requiredResources.every(r =>
    Boolean(findStorageSlotForResource(node, r))
  );
  const enoughOutputSlots = node.outSlots.every(s => !s.resource);

  if (enoughResources && enoughOutputSlots && !node.producing) {
    const outputResources = node.nodeType.output.map(r => makeResource(r.resourceType, r.amount));

    node.producing = true;

    requiredResources.forEach(r => {
      const slot = findStorageSlotForResource(node, r);

      if (slot) {
        takeResourceOutSlot(slot, r);
      }
    });

    outputResources.forEach(r => {
      const slot = node.outSlots.find(s => slotCanAcceptResource(s, r));

      if (slot) {
        putResourceInSlot(slot, r);
      }
    });

    node.producing = false;
  }
}
