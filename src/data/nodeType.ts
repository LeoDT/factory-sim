const data = JSON.stringify([
  {
    id: 1,
    name: 'basic resource generator',
    resourceRequirements: [{ resourceTypeId: 1, amount: 5 }],
    output: [{ resourceTypeId: 1, amount: 2 }]
  },
  {
    id: 2,
    name: 'advanced A producer',
    resourceRequirements: [{ resourceTypeId: 1, amount: 10 }],
    output: [{ resourceTypeId: 2 }]
  },
  {
    id: 3,
    name: 'advanced B producer',
    resourceRequirements: [{ resourceTypeId: 3, amount: 2 }],
    output: [{ resourceTypeId: 3 }]
  }
]);

export type NodeTypeJSON = Array<{
  id: number;
  name: string;
  resourceRequirements?: Array<{ resourceTypeId: number; amount: number }>;
  output?: Array<{ resourceTypeId: number; amount?: number }>;
}>;

export { data as nodeData };
