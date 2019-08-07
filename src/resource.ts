import { resourceData, ResourceTypeJSON } from './data/resourceType';

export interface ResourceType {
  id: number;
  name: string;
  requirements: Array<Resource>;
}

export interface Resource {
  resourceType: ResourceType;
  amount: number;
}

const resourceTypes = new Map<number, ResourceType>();

export function loadResourceTypes() {
  const json: ResourceTypeJSON = JSON.parse(resourceData);

  const pendingRequirements: Array<
    [ResourceType, Array<{ resourceTypeId: number; amount: number }>]
  > = [];

  json.forEach(({ requirements, ...r }) => {
    const type = { ...r, requirements: [] };

    if (Array.isArray(requirements)) {
      pendingRequirements.push([type, requirements]);
    }

    resourceTypes.set(type.id, type);
  });

  pendingRequirements.forEach(([type, requirements]) => {
    type.requirements = requirements.map(({ resourceTypeId, amount }) =>
      makeResourceWithTypeId(resourceTypeId, amount)
    );
  });

  console.debug('loaded resource types', resourceTypes);
}

export function getResourceTypeById(id: number) {
  return resourceTypes.get(id);
}

export function makeResource(resourceType: ResourceType, amount: number): Resource {
  return {
    resourceType,
    amount
  };
}

export function cloneResource(resource: Resource) {
  return makeResource(resource.resourceType, resource.amount);
}

export function makeResourceWithTypeId(resourceTypeId: number, amount: number) {
  const resourceType = getResourceTypeById(resourceTypeId);

  if (resourceType) {
    return makeResource(resourceType, amount);
  }

  throw new Error(`node load error, unknown resourceTypeId: ${resourceTypeId}`);
}

export function isResourceRequirementsFullfilled(
  resourceType: ResourceType,
  resources: Array<Resource>
) {
  const { requirements } = resourceType;

  if (requirements) {
    return requirements.every(requirement => {
      const resource = resources.find(
        ({ resourceType }) => resourceType === requirement.resourceType
      );

      return resource && resource.amount >= requirement.amount;
    });
  }

  return true;
}

export function mergeResources(resources: Array<Resource>) {
  return resources.reduce<Array<Resource>>((acc, resource) => {
    const hit = acc.find(r => r.resourceType === resource.resourceType);

    if (hit) {
      hit.amount += resource.amount;
    } else {
      acc.push(cloneResource(resource));
    }

    return acc;
  }, []);
}

export function getRequiredResourcesForResources(resources: Array<Resource>) {
  const requirements: Array<Resource> = resources
    .map(({ resourceType }) => resourceType.requirements || [])
    .reduce<Array<Resource>>((acc, v) => acc.concat(v), []);

  return mergeResources(requirements);
}
