const data = JSON.stringify([
  {
    id: 1,
    name: 'basic'
  },
  {
    id: 2,
    name: 'advanced A',
    requirements: [{ resourceTypeId: 1, amount: 2 }]
  },
  {
    id: 3,
    name: 'advanced B',
    requirements: [{ resourceTypeId: 1, amount: 1 }, { resourceTypeId: 2, amount: 1 }]
  }
]);

export type ResourceTypeJSON = Array<{
  id: number;
  name: string;
  requirements: Array<{ resourceTypeId: number; amount: number }>;
}>;

export { data as resourceData };
