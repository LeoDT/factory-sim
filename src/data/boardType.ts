const data = JSON.stringify([
  {
    id: 1,
    name: 'Constitution',
    shape: [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1]],
    color: 'red-500'
  },
  {
    id: 2,
    name: 'Perception',
    shape: [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1]],
    color: 'blue-500'
  },
  {
    id: 3,
    name: 'Will',
    shape: [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1]],
    color: 'green-500'
  },
  {
    id: 4,
    name: 'Enemy',
    shape: [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1]],
    color: 'yellow-500'
  }
]);

export type BoardTypeJSON = Array<{
  id: number;
  name: string;
  shape: Array<Array<0 | 1>>;
  color: string;
}>;

export { data as boardData };
