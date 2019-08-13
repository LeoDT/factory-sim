import { observable, IObservableObject } from 'mobx';
import { generateShortId } from '~utils/shortid';

import { Slot, slotCanAcceptResource, slotCanAffordResource } from './slot';
import { Resource } from './resource';

export interface Port extends IObservableObject {
  slots: Slot[];
}

export function makePort(slots: Slot[], id: string = generateShortId()): Port {
  return observable.object(
    {
      id,
      slots
    },
    {},
    {
      deep: false
    }
  );
}

export function getPortDefaultResource(port: Port): Resource | undefined {
  const nonEmptySlot = port.slots.find(s => s.resource);

  if (nonEmptySlot) {
    return nonEmptySlot.resource;
  }
}

export function portSlotCanAcceptResource(port: Port, resource: Resource): Slot | undefined {
  return port.slots.find(s => slotCanAcceptResource(s, resource));
}

export function portSlotCanAffordResource(port: Port, resource: Resource): Slot | undefined {
  return port.slots.find(s => slotCanAffordResource(s, resource));
}
