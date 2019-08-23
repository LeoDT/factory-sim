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

export function getNonEmptyPortResources(port: Port): Resource[] {
  const resources: Resource[] = [];

  port.slots.forEach(s => {
    if (s.resource) {
      resources.push(s.resource);
    }
  });

  return resources;
}

export function portSlotCanAcceptResource(port: Port, resource: Resource): Slot | undefined {
  return port.slots.find(s => slotCanAcceptResource(s, resource));
}

export function portSlotCanAffordResource(port: Port, resource: Resource): Slot | undefined {
  return port.slots.find(s => slotCanAffordResource(s, resource));
}

export function canPortsBeLinked(from: Port, to: Port): boolean {
  if (from === to) return false;

  const fromResourceTypes = from.slots.map(s => s.resourceTypes).reduce((a, t) => a.concat(t), []);
  const toResourceTypes = to.slots.map(s => s.resourceTypes).reduce((a, t) => a.concat(t), []);

  if (to.slots.length > 0 && toResourceTypes.length === 0) {
    return true;
  }

  return fromResourceTypes.some(t => toResourceTypes.indexOf(t) !== -1);
}
