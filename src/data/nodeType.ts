const data = JSON.stringify([
  {
    id: 1,
    name: 'basic resource generator',
    resourceRequirements: [{ resourceTypeId: 1, amount: 5 }],
    output: [{ resourceTypeId: 1 }],
    cycle: 2
  },
  {
    id: 2,
    name: 'advanced A producer',
    resourceRequirements: [{ resourceTypeId: 1, amount: 10 }],
    output: [{ resourceTypeId: 2 }],
    cycle: 4
  },
  {
    id: 3,
    name: 'advanced B producer',
    resourceRequirements: [{ resourceTypeId: 2, amount: 2 }],
    output: [{ resourceTypeId: 3 }],
    cycle: 7
  }
]);

export type NodeTypeJSON = Array<{
  id: number;
  name: string;
  resourceRequirements?: Array<{ resourceTypeId: number; amount: number }>;
  output?: Array<{ resourceTypeId: number; amount?: number }>;
  cycle: number;
}>;

export { data as nodeData };
