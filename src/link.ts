import { observable, IObservableObject } from 'mobx';

import { globalClock } from './observables';

import {
  Slot,
  makeSlot,
  slotCanAffordResource,
  putResourceInSlot,
  takeResourceOutSlot,
  slotCanAcceptResource
} from './slot';
import { makeResource } from './resource';
import { generateShortId } from '~utils/shortid';

export interface Link extends IObservableObject {
  id: string;
  from: Slot;
  to: Slot;
  holding: Slot;
}

export function makeLink(from: Slot, to: Slot, id: string = generateShortId()): Link {
  return observable.object(
    {
      id,
      from,
      to,
      holding: makeSlot([], 1)
    },
    {},
    { deep: false }
  );
}

export function runLink(link: Link): void {
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

export function makeAndStartLink(from: Slot, to: Slot): Link {
  const link = makeLink(from, to);

  globalClock.subscribe(() => {
    runLink(link);
  });

  return link;
}
