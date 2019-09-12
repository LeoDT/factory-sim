const data = JSON.stringify([
  {
    id: 1,
    name: '蓄力',
    output: [{ resourceTypeId: 1 }],
    cycle: 10,
    shape: 2,
    color: 'red-500',
    workOnBoardId: 1
  },
  {
    id: 2,
    name: '攻击',
    output: [{ resourceTypeId: 2 }],
    cycle: 15,
    shape: 3,
    color: 'green-500',
    workOnBoardId: 1
  },
  {
    id: 3,
    name: '格挡',
    output: [{ resourceTypeId: 3 }],
    cycle: 15,
    shape: 3,
    color: 'blue-500',
    workOnBoardId: 1
  }
]);

export type NodeTypeJSON = Array<{
  id: number;
  name: string;
  resourceRequirements?: Array<{ resourceTypeId: number; amount: number }>;
  output?: Array<{ resourceTypeId: number; amount?: number }>;
  cycle: number;
  shape: Array<Array<0 | 1>>;
  color: string;
  workOnBoardId: number;
}>;

export { data as nodeData };
