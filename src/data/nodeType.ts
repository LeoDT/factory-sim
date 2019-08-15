import { TileArea } from '~core/tile';

const data = JSON.stringify([
  {
    id: 1,
    name: 'basic resource generator',
    resourceRequirements: [{ resourceTypeId: 1, amount: 5 }],
    output: [{ resourceTypeId: 1 }],
    cycle: 2,
    tiles: [{ lt: [0, 0], rb: [1, 0] }]
  },
  {
    id: 2,
    name: 'advanced A producer',
    resourceRequirements: [{ resourceTypeId: 1, amount: 10 }],
    output: [{ resourceTypeId: 2 }],
    cycle: 4,
    tiles: [{ lt: [0, 0], rb: [1, 1] }]
  },
  {
    id: 3,
    name: 'advanced B producer',
    resourceRequirements: [{ resourceTypeId: 2, amount: 2 }],
    output: [{ resourceTypeId: 3 }],
    cycle: 7,
    tiles: [{ lt: [0, 0], rb: [2, 2] }]
  }
]);

export type NodeTypeJSON = Array<{
  id: number;
  name: string;
  resourceRequirements?: Array<{ resourceTypeId: number; amount: number }>;
  output?: Array<{ resourceTypeId: number; amount?: number }>;
  cycle: number;
  tiles: TileArea[];
}>;

export { data as nodeData };
