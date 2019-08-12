const data = JSON.stringify([
  {
    id: 1,
    name: 'basic',
    icon: '📕'
  },
  {
    id: 2,
    name: 'advanced A',
    requirements: [{ resourceTypeId: 1, amount: 2 }],
    icon: '📗'
  },
  {
    id: 3,
    name: 'advanced B',
    requirements: [{ resourceTypeId: 1, amount: 1 }, { resourceTypeId: 2, amount: 1 }],
    icon: '📘'
  }
]);

export type ResourceTypeJSON = Array<{
  id: number;
  name: string;
  icon: string;
  requirements: Array<{ resourceTypeId: number; amount: number }>;
}>;

export { data as resourceData };
