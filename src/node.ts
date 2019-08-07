import { nodeData, NodeTypeJSON } from './data/nodeType';
import { Resource, makeResourceWithTypeId, getRequiredResourcesForResources } from './resource';
import { Slot, makeSlot } from './slot';

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

  inSlots: Array<Slot>; // default 1 slot, accept anything
  outSlots: Array<Slot>; // n slots, n = output length
  storage: Array<Slot>; // n slots, n = all output's unique requirements length
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

export function makeNode(nodeType: NodeType) {
  const resourcesForProduce = getRequiredResourcesForResources(nodeType.output);

  const node = {
    nodeType,

    inSlots: makeSlot(resourcesForProduce.map(r => r.resourceType), 1),
    outSlots: nodeType.output.map(r => makeSlot([r.resourceType], 1)),
    storage: resourcesForProduce.map(r =>
      makeSlot([r.resourceType], r.amount * NODE_STORAGE_MULTIPLIER)
    )
  };

  return node;
}
