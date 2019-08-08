import {
  Slot,
  makeSlot,
  slotCanAffordResource,
  putResourceInSlot,
  takeResourceOutSlot,
  slotCanAcceptResource
} from './slot';
import { makeResource } from './resource';

export interface Link {
  from: Slot;
  to: Slot;
  holding: Slot;
}

export function makeLink(from: Slot, to: Slot): Link {
  return {
    from,
    to,
    holding: makeSlot([], 1)
  };
}

export function runLink(link: Link) {
  if (link.holding.resource) {
    const { resource } = link.holding;

    if (slotCanAcceptResource(link.to, link.holding.resource)) {
      takeResourceOutSlot(link.holding, resource);
      putResourceInSlot(link.to, resource);
    }
  } else if (link.from.resource) {
    const resource = makeResource(link.from.resource.resourceType, 1);

    if (slotCanAffordResource(link.from, resource)) {
      takeResourceOutSlot(link.from, resource);
      putResourceInSlot(link.holding, resource);
    }
  }
}
