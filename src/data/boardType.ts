const data = JSON.stringify([
  {
    id: 1,
    name: 'board A',
    shape: [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1]]
  }
]);

export type BoardTypeJSON = Array<{
  id: number;
  name: string;
  shape: Array<Array<0 | 1>>;
}>;

export { data as boardData };
