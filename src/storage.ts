import { observable, IObservableObject } from 'mobx';

import { storageData, StorageTypeJSON } from '~/data/storageType';
import { range } from '~/utils/range';

import { Slot, makeSlot, slotCanAcceptResource } from './slot';
import { Resource } from './resource';
import { generateShortId } from '~utils/shortid';

export interface StorageType {
  id: number;
  name: string;
  slots: number;
  slotCapacity: number;
}

export interface Storage extends IObservableObject {
  id: string;
  storageType: StorageType;
  slots: Slot[];
}

const storageTypes = new Map<number, StorageType>();

export function loadStorageTypes(): void {
  const json: StorageTypeJSON = JSON.parse(storageData);

  json.forEach(j => {
    const storageType: StorageType = {
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
  return observable.object(
    {
      id,
      storageType,
      slots: range(storageType.slots).map(() => makeSlot([], storageType.slotCapacity))
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
