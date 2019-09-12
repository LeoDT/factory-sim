import { IObservableObject, observable, IObservableArray, runInAction, reaction } from 'mobx';
import SimplexNoise from 'simplex-noise';

import { boardData, BoardTypeJSON } from '~/data/boardType';

import { Node } from '~core/node';
import {
  Slot,
  slotCanAcceptResource,
  slotCanAffordResource,
  makeSlot,
  takeResourceOutSlot,
  putResourceInSlot
} from '~core/slot';

import { sendToGlobals } from '~utils/debug';
import { generateShortId } from '~utils/shortid';

import { TileShape, TileGroup, makeTileGroup, getTileGroupsOffset } from './tile';
import { Cycler, makeCycler } from './cycler';
import { LAYERS } from './layer';
import { Resource, makeResource } from './resource';
import { getNonEmptyPortResources, portSlotCanAffordResource } from './port';
import { runClock } from './clocks';

export type ThingOnBoard = Node | Slot;
export type UsedTile = ThingOnBoard | null;

export interface BoardType {
  _type: 'BoardType';
  id: number;

  name: string;
  shape: TileShape;
  color: string;
}

export interface Board extends IObservableObject {
  _type: 'Board';
  id: string;

  boardType: BoardType;
  cycler: Cycler;

  tileGroup: TileGroup;
  usedTiles: IObservableArray<IObservableArray<UsedTile>>;

  thingsOnBoard: Set<ThingOnBoard>;
  nodes: Set<Node>;
  slots: Set<Slot>;
}

export const boardTypes = new Map<number, BoardType>();

sendToGlobals({ boardTypes });

export function loadBoardTypes(): void {
  const json: BoardTypeJSON = JSON.parse(boardData);

  json.forEach(data => {
    const boardType: BoardType = {
      _type: 'BoardType',
      ...data
    };

    boardTypes.set(boardType.id, boardType);
  });

  console.debug('loaded board types', boardTypes);
}

export function makeRandomBoardType(): BoardType {
  const id = Date.now();
  const simplex = new SimplexNoise(id.toString());
  const tileSize = [5, 5];

  const shape: TileShape = [];

  for (let y = 0; y < tileSize[1]; y++) {
    const row: Array<0 | 1> = [];

    for (let x = 0; x < tileSize[0]; x++) {
      const cell = simplex.noise2D(x, y);

      row.push(cell > -0.3 ? 1 : 0);
    }

    shape.push(row);
  }

  return {
    _type: 'BoardType',
    id,

    name: `random board ${id}`,
    shape,
    color: 'gray'
  };
}

export function makeBoard(
  boardType: BoardType,
  tile: Vector2,
  id: string = generateShortId()
): Board {
  const board: Board = observable.object(
    {
      _type: 'Board',
      boardType,
      id,

      cycler: makeCycler(2),

      tileGroup: makeTileGroup(tile, boardType.shape, false, LAYERS.board),
      usedTiles: observable.array(
        boardType.shape.map<IObservableArray<UsedTile>>(row =>
          observable.array(new Array(row.length).fill(null), { deep: false })
        ),
        { deep: false }
      ),
      get thingsOnBoard(): Set<ThingOnBoard> {
        const set = new Set<ThingOnBoard>();

        this.usedTiles.forEach(row => {
          row.forEach(c => {
            if (c) {
              set.add(c);
            }
          });
        });

        return set;
      },
      get nodes(): Set<Node> {
        const set = new Set<Node>();

        for (let t of this.thingsOnBoard) {
          if (t._type === 'Node') set.add(t);
        }

        return set;
      },
      get slots(): Set<Slot> {
        const set = new Set<Slot>();

        for (let t of this.thingsOnBoard) {
          if (t._type === 'Slot') set.add(t);
        }

        return set;
      }
    },
    {},
    { deep: false }
  );

  reaction(
    () => {
      const groups = [];
      for (const t of board.thingsOnBoard) {
        groups.push(t.tileGroup);
      }

      return groups;
    },
    groups => {
      board.tileGroup.children = groups;
    }
  );

  return board;
}

export function runBoard(board: Board): void {
  switch (board.cycler.state) {
    case 'IDLE':
      for (const node of board.nodes) {
        if (node.outPort) {
          const outResources = getNonEmptyPortResources(node.outPort);

          for (const fromResource of outResources) {
            const toSlot = getSlotForResource(board, fromResource);

            if (toSlot) {
              const resource = makeResource(fromResource.resourceType, 1);
              const fromSlot = portSlotCanAffordResource(node.outPort, resource);

              if (fromSlot) {
                takeResourceOutSlot(fromSlot, resource);
                putResourceInSlot(toSlot, resource);
              }
            }
          }
        }
      }
      board.cycler.tick();
      break;

    case 'FINISH':
      for (const node of board.nodes) {
        if (node.inPort) {
          for (const toSlot of node.inPort.slots) {
            for (const resourceType of toSlot.resourceTypes) {
              const resourceNeeded = makeResource(resourceType, 1);
              const fromSlot = getSlotForResource(board, resourceNeeded, false);

              if (fromSlot) {
                takeResourceOutSlot(fromSlot, resourceNeeded);
                putResourceInSlot(toSlot, resourceNeeded);
              }
            }
          }
        }
      }
      board.cycler.tick();
      break;
    default:
      board.cycler.tick();
      break;
  }
}

export function addThingToBoard(board: Board, thing: ThingOnBoard): void {
  const tileGroupOffset = getTileGroupsOffset(board.tileGroup, thing.tileGroup);

  runInAction(() => {
    for (let y = 0; y < thing.tileGroup.shape.length; y++) {
      const row = thing.tileGroup.shape[y];

      for (let x = 0; x < row.length; x++) {
        const cell = row[x];

        if (cell === 0) continue;

        const bx = x + tileGroupOffset[0];
        const by = y + tileGroupOffset[1];

        if (board.usedTiles[by][bx] === null) {
          board.usedTiles[by][bx] = thing;
        } else {
          throw new Error(`[${bx}, ${by}] in board is not empty`);
        }
      }
    }
  });
}

export function removeThingFromBoard(board: Board, thing: ThingOnBoard): void {
  runInAction(() => {
    for (let y = 0; y < board.usedTiles.length; y++) {
      const row = board.usedTiles[y];

      for (let x = 0; x < row.length; x++) {
        const cell = row[x];

        if (cell === thing) {
          board.usedTiles[y][x] = null;
        }
      }
    }
  });
}

export function boardAcceptThing(board: Board, thing: ThingOnBoard): boolean {
  switch (thing._type) {
    case 'Node':
      return board.boardType === thing.nodeType.workOnBoard;

    default:
      return true;
  }
}

export function getFreeTileForSlot(board: Board): Vector2 | null {
  for (let y = 0; y < board.usedTiles.length; y++) {
    const row = board.usedTiles[y];

    for (let x = 0; x < row.length; x++) {
      const cell = row[x];

      if (cell === null) {
        return [x, y];
      }
    }
  }

  return null;
}

export function getSlotForResource(
  board: Board,
  resource: Resource,
  isAccept: boolean = true
): Slot | null {
  let slot = null;
  const check = isAccept ? slotCanAcceptResource : slotCanAffordResource;

  for (const s of board.slots) {
    if (check(s, resource)) {
      slot = s;
    }
  }

  if (!slot && isAccept) {
    const tile = getFreeTileForSlot(board);

    if (tile) {
      slot = makeSlot(
        [resource.resourceType],
        [tile[0] + board.tileGroup.tile[0], tile[1] + board.tileGroup.tile[1]],
        50
      );

      addThingToBoard(board, slot);
    }
  }

  return slot;
}

export function makeAndStartBoard(boardType: BoardType, tile: Vector2): Board {
  const board = makeBoard(boardType, tile);

  runClock.subscribe(() => {
    runBoard(board);
  });

  return board;
}
