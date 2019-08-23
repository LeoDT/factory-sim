import { observable, IObservableObject } from 'mobx';

import { generateShortId } from '~utils/shortid';

import { runClock } from './clocks';
import { Slot, makeSlot, putResourceInSlot, takeResourceOutSlot } from './slot';
import { makeResource } from './resource';
import {
  Port,
  portSlotCanAcceptResource,
  portSlotCanAffordResource,
  getNonEmptyPortResources
} from './port';
import { Cycler, makeCycler } from './cycler';

export interface Link extends IObservableObject {
  id: string;
  from: Port;
  to: Port;
  holding: Slot;
  cycler: Cycler;
}

export function makeLink(from: Port, to: Port, id: string = generateShortId()): Link {
  return observable.object(
    {
      id,
      from,
      to,
      holding: makeSlot([], undefined, 1),
      cycler: makeCycler(3)
    },
    {},
    { deep: false }
  );
}

export function runLink(link: Link): void {
  switch (link.cycler.state) {
    case 'IDLE':
      const fromResources = getNonEmptyPortResources(link.from);

      fromResources.forEach(fromResource => {
        const resource = makeResource(fromResource.resourceType, 1);
        const fromSlot = portSlotCanAffordResource(link.from, resource);

        if (fromSlot) {
          takeResourceOutSlot(fromSlot, resource);
          putResourceInSlot(link.holding, resource);

          link.cycler.tick();
        }
      });

      break;

    case 'FINISH':
      if (link.holding.resource) {
        const { resource } = link.holding;
        const toSlot = portSlotCanAcceptResource(link.to, link.holding.resource);

        if (toSlot) {
          takeResourceOutSlot(link.holding, resource);
          putResourceInSlot(toSlot, resource);

          link.cycler.tick();
        }
      }
      break;
    default:
      link.cycler.tick();
      break;
  }
}

export function makeAndStartLink(from: Port, to: Port): Link {
  const link = makeLink(from, to);

  runClock.subscribe(() => {
    runLink(link);
  });

  return link;
}
