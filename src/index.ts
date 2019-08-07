import { loadResourceTypes, getRequiredResourcesForResources } from './resource';
import { loadNodeTypes, getNodeTypeById } from './node';

function init() {
  loadResourceTypes();
  loadNodeTypes();

  const nodeType = getNodeTypeById(3);

  if (nodeType && nodeType.output) {
    console.log(getRequiredResourcesForResources(nodeType.output));
  }
}

init();
