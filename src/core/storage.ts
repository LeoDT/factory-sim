import { observable, IObservableObject } from 'mobx';

import { storageData, StorageTypeJSON } from '~/data/storageType';
import { range } from '~/utils/range';
import { generateShortId } from '~utils/shortid';

import { Slot, makeSlot, slotCanAcceptResource } from './slot';
import { Resource } from './resource';
import { makePort, Port } from './port';
import { TileGroup, makeTileGroup, TileShape } from './tile';

export interface StorageType {
  _type: 'StorageType';

  id: number;
  name: string;
  slots: number;
  slotCapacity: number;
  shape: TileShape;
}

export interface Storage extends IObservableObject {
  _type: 'Storage';

  id: string;
  storageType: StorageType;
  port: Port;
  slots: Slot[];
  tileGroup: TileGroup;
}

export const storageTypes = new Map<number, StorageType>();

export function loadStorageTypes(): void {
  const json: StorageTypeJSON = JSON.parse(storageData);

  json.forEach(j => {
    const storageType: StorageType = {
      _type: 'StorageType',
      ...j
    };

    storageTypes.set(storageType.id, storageType);
  });

  console.debug('loaded storage types', storageTypes);
}

export function getStorageTypeById(storageTypeId: number): StorageType | undefined {
  return storageTypes.get(storageTypeId);
}

export function makeStorage(storageType: StorageType, id: string = generateShortId()): Storage {
  const slots = range(storageType.slots).map(() =>
    makeSlot([], undefined, storageType.slotCapacity)
  );

  return observable.object(
    {
      _type: 'Storage',

      id,
      storageType,

      port: makePort(slots),
      slots,
      tileGroup: makeTileGroup([0, 0], storageType.shape, false, 1)
    },
    {},
    {
      deep: false
    }
  );
}

export function storageFindAvailableSlotForResource(
  storage: Storage,
  resource: Resource
): Slot | undefined {
  return storage.slots.find(s => slotCanAcceptResource(s, resource));
}
