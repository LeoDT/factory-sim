import { TileArea } from '~core/tile';

const data = JSON.stringify([
  {
    id: 1,
    name: 'basic storage',
    slots: 5,
    slotCapacity: 10,
    tiles: [{ lt: [0, 0], rb: [4, 2] }]
  }
]);

export type StorageTypeJSON = Array<{
  id: number;
  name: string;
  slots: number;
  slotCapacity: number;
  tiles: TileArea[];
}>;

export { data as storageData };
