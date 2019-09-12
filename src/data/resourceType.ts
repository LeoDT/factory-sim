const data = JSON.stringify([
  {
    id: 1,
    name: 'Power',
    icon: '💪'
  },
  {
    id: 2,
    name: 'Slash',
    requirements: [{ resourceTypeId: 1, amount: 2 }],
    icon: '🗡'
  },
  {
    id: 3,
    name: 'Block',
    requirements: [{ resourceTypeId: 1, amount: 1 }],
    icon: '🛡'
  }
]);

export type ResourceTypeJSON = Array<{
  id: number;
  name: string;
  icon: string;
  requirements: Array<{ resourceTypeId: number; amount: number }>;
}>;

export { data as resourceData };
