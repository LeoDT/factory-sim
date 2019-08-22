import { observable, IObservableObject, IObservableArray } from 'mobx';
import { clamp } from '~utils/numbers';

export type Tile = Vector2;

// used in most calculate
export type TileShape = Array<Array<0 | 1>>;

// used in draw
export interface TileArea {
  lt: Tile; // left top tile
  rb: Tile; // right bottom tile
}

export interface TileGroup {
  tile: Tile;
  shape: TileShape;
  collisionGroup: number; // collision happens to same group

  shapeRect: Vector2;
  areas: TileArea[];
  mergedArea: TileArea;
}

export interface TileScene extends IObservableObject {
  tileSize: number;
  offset: Vector2;

  tileGroups: IObservableArray<TileGroup>;
}

export function makeTile(x: number, y: number): Tile {
  return [x, y];
}

export function makeTileGroup(tile: Tile, shape: TileShape, collisionGroup: number = 0): TileGroup {
  const areas = convertShapeToAreas(shape);

  return {
    tile,
    shape,
    shapeRect: getShapeRect(shape),
    areas,
    collisionGroup,
    mergedArea: mergeTileAreas(areas)
  };
}

export function makeTileScene(tileSize: number, offset: Vector2 = [0, 0]): TileScene {
  return observable.object(
    {
      tileSize,
      offset,

      tileGroups: observable.array([], { deep: false })
    },
    {},
    {
      deep: false
    }
  );
}

export function getShapeRect(shape: TileShape): Vector2 {
  if (typeof shape[0] === 'undefined') {
    throw new TypeError('tile shape should not be empty');
  }

  return [shape[0].length, shape.length];
}

export function convertShapeToAreas(shape: TileShape): TileArea[] {
  const areas = [];

  for (let y = 0; y < shape.length; y++) {
    let left = -1,
      right = -1;
    const row = shape[y];

    for (let x = 0; x < row.length; x++) {
      const cell = row[x];

      if (cell === 1) {
        left = left !== -1 ? left : x;
        right = right !== -1 ? right : x;

        if (left !== -1) {
          right = x;
        }
      }

      if (cell === 0 || x === row.length - 1) {
        if (left !== -1 && right !== -1) {
          areas.push({
            lt: makeTile(left, y),
            rb: makeTile(right, y)
          });

          left = -1;
          right = -1;
        }
      }
    }
  }

  return areas;
}

export function getSnappedPosition(tileScene: TileScene, position: Vector2): Vector2 {
  const { tileSize } = tileScene;
  const [x, y] = position.map(n => clamp(n, 0));

  return [Math.floor(x / tileSize) * tileSize, Math.floor(y / tileSize) * tileSize];
}

export function getPositionForTile(tileScene: TileScene, tile: Tile): Vector2 {
  const { tileSize } = tileScene;
  const [x, y] = tile;

  return [x * tileSize, y * tileSize];
}

export function getTileForPosition(tileScene: TileScene, position: Vector2): Tile {
  const { tileSize } = tileScene;
  const [x, y] = position;

  return makeTile(Math.floor(x / tileSize), Math.floor(y / tileSize));
}

export function getTileAreaTileSize({ lt, rb }: TileArea): Vector2 {
  return [rb[0] - lt[0] + 1, rb[1] - lt[1] + 1];
}

export function getTileAreaSize({ tileSize }: TileScene, area: TileArea): Vector2 {
  return getTileAreaTileSize(area).map(d => d * tileSize) as Vector2;
}

export function mergeTileAreas(areas: TileArea[]): TileArea {
  if (areas.length < 1) throw new Error('tile group must have 1 tile area at least');

  let leftTop: Tile = areas[0].lt;
  let rightBottom: Tile = areas[0].rb;

  areas.forEach(({ lt, rb }) => {
    if (lt[0] < leftTop[0] || lt[1] < leftTop[1]) {
      leftTop = lt;
    }

    if (rb[0] > rightBottom[0] || rb[1] > rightBottom[1]) {
      rightBottom = rb;
    }
  });

  return { lt: leftTop, rb: rightBottom };
}

export function getTileGroupSize(tileScene: TileScene, tileGroup: TileGroup): Vector2 {
  return getTileAreaTileSize(tileGroup.mergedArea).map(d => d * tileScene.tileSize) as Vector2;
}

export function tileGroupCollisionTest(aGroup: TileGroup, bGroup: TileGroup): boolean {
  if (aGroup.collisionGroup !== bGroup.collisionGroup) {
    return false;
  }

  // there is no TileArea in aGroup collide with any TileArea in bGroup
  for (let i = 0; i < aGroup.areas.length; i++) {
    const a = aGroup.areas[i];
    const at = [aGroup.tile[0] + a.lt[0], aGroup.tile[1] + a.lt[1]];

    for (let j = 0; j < bGroup.areas.length; j++) {
      const b = bGroup.areas[j];
      const bt = [bGroup.tile[0] + b.lt[0], bGroup.tile[1] + b.lt[1]];

      if (
        at[0] < bt[0] + b.rb[0] - b.lt[0] + 1 &&
        at[0] + a.rb[0] - a.lt[0] + 1 > bt[0] &&
        at[1] < bt[1] + b.rb[1] - b.lt[1] + 1 &&
        at[1] + a.rb[1] - a.lt[1] + 1 > bt[1]
      ) {
        return true;
      }
    }
  }

  return false;
}

export function tileGroupContainsAnother(parent: TileGroup, child: TileGroup): boolean {
  if (parent.collisionGroup === child.collisionGroup) {
    return false;
  }

  if (
    parent.tile[0] > child.tile[0] ||
    parent.tile[0] + parent.shapeRect[0] < child.tile[0] ||
    parent.tile[1] > child.tile[1] ||
    parent.tile[1] + parent.shapeRect[1] < child.tile[1]
  ) {
    return false;
  }

  const offset = [child.tile[0] - parent.tile[0], child.tile[1] - parent.tile[1]];

  // there should be a corresponding cell === 1 in parent when child cell === 1
  for (let y = 0; y < child.shape.length; y++) {
    const row = child.shape[y];
    const pRow = parent.shape[y + offset[1]];

    if (typeof pRow === 'undefined') return false;

    for (let x = 0; x < row.length; x++) {
      const cell = row[x];
      const pCell = pRow[x + offset[0]];

      if (typeof pCell === 'undefined') return false;

      if (cell === 1 && pCell === 0) {
        return false;
      }
    }
  }

  return true;
}

export function canTileGroupMoveToTile(
  tileScene: TileScene,
  tileGroup: TileGroup,
  tile: Tile
): boolean {
  const newGroup = { ...tileGroup, tile };

  return !tileScene.tileGroups.some(g => g !== tileGroup && tileGroupCollisionTest(g, newGroup));
}
