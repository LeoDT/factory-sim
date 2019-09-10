import { randomPick } from '../utils/array';
import { TileShape } from './tile';

export type BlokusBlockAmount = 1 | 2 | 3 | 4 | 5;

// prettier-ignore
export const blokus: Record<BlokusBlockAmount, TileShape[]> = {
  1: [
    [[1]]
  ],
  2: [
    [[1, 1]]
  ],
  3: [
    [[1,1], [0, 1]],
    [[1, 1, 1]]
  ],
  4: [
    [[1,1], [1,1]],
    [[0,1,0], [1,1,1]],
    [[1,1,1,1]],
    [[0,0,1], [1,1,1]],
    [[0,1,1], [1,1,0]]
  ],
  5: [
    [[1,0,0,0], [1,1,1,1]],
    [[0,1,0], [0,1,0], [1,1,1]],
    [[1,0,0], [1,0,0], [1,1,1]],
    [[0,1,1,1], [1,1,0,0]],
    [[0,0,1], [1,1,1], [1,0,0]],
    [[1,1,1,1,1]],
    [[1,0], [1,1], [1,1]],
    [[0,1,1], [1,1,0], [1,0,0]],
    [[1,1], [1,0], [1,1]],
    [[0,1,1], [1,1,0], [0,1,0]],
    [[0,1,0], [1,1,1], [0,1,0]],
    [[0,1,0,0], [1,1,1,1]]
  ]
};

type Blokus = typeof blokus;

export function randomBlokusShape(tier: keyof Blokus): TileShape {
  return randomPick(blokus[tier]);
}
