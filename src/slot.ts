import { ResourceType, Resource } from './resource';

export interface Slot {
  resourceTypes: Array<ResourceType>;
  hold: number;
}

export function makeSlot(resourceTypes: Array<ResourceType> = [], hold: number = 1) {
  return {
    resourceTypes,
    hold
  };
}

export function slotAcceptResource(slot: Slot, resource: Resource) {
  return slot.resourceTypes.indexOf(resource.resourceType) !== -1;
}
