import { observable, IObservableObject } from 'mobx';

import { ResourceType, Resource, makeResource } from './resource';
import { TileGroup, makeTileGroup } from './tile';
import { LAYERS } from './layer';
import { generateShortId } from '~utils/shortid';

export interface Slot extends IObservableObject {
  _type: 'Slot';
  id: string;
  // empty means any type
  resourceTypes: ResourceType[];
  tileGroup: TileGroup;

  capacity: number;
  resource?: Resource;
  lockedResource?: Resource;
}

export function makeSlot(
  resourceTypes: ResourceType[] = [],
  tile: Vector2 = [-1, -1],
  capacity: number = 1
): Slot {
  return observable.object(
    {
      _type: 'Slot',
      id: generateShortId(),
      resourceTypes,
      capacity,
      tileGroup: makeTileGroup(tile, [[1]], false, LAYERS.slot),
      get invisible() {
        return this.tileGroup.tile[0] === -1;
      }
    },
    {
      resourceTypes: observable.ref
    }
  );
}

export function putResourceInSlot(slot: Slot, resource: Resource): boolean {
  if (slotCanAcceptResource(slot, resource)) {
    if (slot.resource) {
      slot.resource = makeResource(resource.resourceType, slot.resource.amount + resource.amount);
    } else {
      slot.resource = resource;
    }

    return true;
  }

  return false;
}

export function takeResourceOutSlot(slot: Slot, resource: Resource): boolean {
  if (slot.resource && slotCanAffordResource(slot, resource)) {
    if (slot.resource.amount === resource.amount) {
      slot.resource = undefined;
    } else {
      slot.resource = makeResource(resource.resourceType, slot.resource.amount - resource.amount);
    }

    return true;
  }

  return false;
}

export function getSlotResourceCountWithLockedResource(slot: Slot): number {
  let count = 0;

  if (slot.resource) {
    count += slot.resource.amount;
  }

  if (slot.lockedResource) {
    count += slot.lockedResource.amount;
  }

  return count;
}

export function isValidResourceTypeForSlot(slot: Slot, resourceType: ResourceType): boolean {
  if (slot.resource) {
    return slot.resource.resourceType === resourceType;
  }

  if (slot.lockedResource) {
    return slot.lockedResource.resourceType === resourceType;
  }

  return slot.resourceTypes.length === 0 ? true : slot.resourceTypes.indexOf(resourceType) !== -1;
}

export function slotCanAcceptResource(slot: Slot, resource: Resource): boolean {
  const validType = isValidResourceTypeForSlot(slot, resource.resourceType);
  const slotResourceCount = getSlotResourceCountWithLockedResource(slot);

  return validType && slotResourceCount + resource.amount <= slot.capacity;
}

export function slotCanAffordResource(slot: Slot, resource: Resource): boolean {
  const validType = isValidResourceTypeForSlot(slot, resource.resourceType);
  const slotResourceCount = getSlotResourceCountWithLockedResource(slot);

  return validType && slotResourceCount - resource.amount >= 0;
}

// positive amount: lock empty
// negtive amount: lock resource
export function lockSlot(slot: Slot, resource: Resource): boolean {
  if (resource.amount === 0) {
    throw new TypeError('can not lock with 0 amount');
  }

  if (slot.lockedResource) return false;

  const canLock =
    resource.amount > 0
      ? slotCanAcceptResource(slot, resource)
      : slotCanAffordResource(slot, resource);

  if (canLock) {
    slot.lockedResource = resource;

    return true;
  }

  return false;
}

export function unlockSlot(slot: Slot, resource: Resource): boolean {
  if (
    slot.lockedResource &&
    slot.lockedResource.resourceType === resource.resourceType &&
    slot.lockedResource.amount == resource.amount
  ) {
    slot.lockedResource = undefined;

    return true;
  }

  return false;
}
