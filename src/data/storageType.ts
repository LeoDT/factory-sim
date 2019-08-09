const data = JSON.stringify([
  {
    id: 1,
    name: 'basic storage',
    slots: 10,
    slotCapacity: 50
  }
]);

export type StorageTypeJSON = Array<{
  id: number;
  name: string;
  slots: number;
  slotCapacity: number;
}>;

export { data as storageData };
