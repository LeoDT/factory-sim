import { TileArea } from '~core/tile';

const data = JSON.stringify([
  {
    id: 1,
    name: 'basic storage',
    slots: 5,
    slotCapacity: 10,
    shape: [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]]
  }
]);

export type StorageTypeJSON = Array<{
  id: number;
  name: string;
  slots: number;
  slotCapacity: number;
  tiles: TileArea[];
  shape: Array<Array<0 | 1>>;
}>;

export { data as storageData };
