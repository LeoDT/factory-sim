import { computed, observable, IObservableObject, ObservableMap } from 'mobx';
import { clamp } from '~utils/numbers';
import { transformTranslate } from '~utils/dom';
import { addVector2, subVector2 } from '~utils/vector';
import { rotateMatrix } from '~utils/array';

export type Tile = Vector2;

// used in most calculate
export type TileShape = Array<Array<0 | 1>>;

// used in draw
export interface TileArea {
  lt: Tile; // left top tile
  rb: Tile; // right bottom tile
}

export interface TileGroup extends IObservableObject {
  tile: Tile;
  shape: TileShape;
  layer: number; // collision happens to same layer, and bigger layer got bigger z
  rotate: number;
  rotatable: boolean;

  transformedShape: TileShape;
  shapeRect: Vector2;
  areas: TileArea[];
  children: TileGroup[];
}

export interface TileScene extends IObservableObject {
  tileSize: number;
  sceneTileSize: Vector2;

  sceneDimension: Vector2;

  viewport: {
    xy: Vector2;
    setXY: (xy: Vector2) => void;
    dimension: Vector2;
  };

  tileGroups: ObservableMap<TileGroup, HTMLElement>;
}

export function makeTile(x: number, y: number): Tile {
  return [x, y];
}

export function makeTileGroup(
  tile: Tile,
  shape: TileShape,
  rotatable: boolean,
  layer: number = 0
): TileGroup {
  return observable.object(
    {
      tile,
      shape,
      rotate: 0,
      rotatable,
      get transformedShape() {
        let shape = this.shape;
        const n = Math.floor(this.rotate / 90);

        for (let i = 0; i < n; i++) {
          shape = rotateMatrix(shape);
        }

        return shape;
      },
      get shapeRect() {
        return getShapeRect(this.transformedShape);
      },
      get areas() {
        return convertShapeToAreas(this.transformedShape);
      },
      layer,
      children: []
    },
    {
      shapeRect: computed,
      areas: computed,
      transformedShape: computed
    },
    { deep: false }
  );
}

export function makeTileScene(
  tileSize: number,
  sceneTileSize: Vector2,
  viewportDimension: Vector2
): TileScene {
  const sceneDimension: Vector2 = [sceneTileSize[0] * tileSize, sceneTileSize[1] * tileSize];
  const viewportInitial: Vector2 = [
    sceneDimension[0] / 2 - viewportDimension[0] / 2,
    sceneDimension[1] / 2 - viewportDimension[1] / 2
  ];

  const viewport = observable.object(
    {
      xy: viewportInitial,
      setXY(xy: Vector2) {
        this.xy = [
          clamp(xy[0], 0, sceneDimension[0] - viewportDimension[0]),
          clamp(xy[1], 0, sceneDimension[1] - viewportDimension[1])
        ];
      },
      dimension: viewportDimension
    },
    {},
    { deep: false }
  );

  return observable.object(
    {
      tileSize,
      sceneTileSize,

      sceneDimension,
      viewport,

      tileGroups: observable.map<TileGroup, HTMLElement>(new Map(), { deep: false })
    },
    {},
    {
      deep: false
    }
  );
}

export function clampViewportOffset(tileScene: TileScene, offset: Vector2): Vector2 {
  const { sceneDimension, viewport } = tileScene;

  return [
    clamp(offset[0], 0, sceneDimension[0] - viewport.dimension[0]),
    clamp(offset[1], 0, sceneDimension[1] - viewport.dimension[1])
  ];
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

export function getTileGroupsOffset(aGroup: TileGroup, bGroup: TileGroup): Vector2 {
  return subVector2(bGroup.tile, aGroup.tile);
}

export function tileGroupCollisionTest(aGroup: TileGroup, bGroup: TileGroup): boolean {
  if (aGroup.layer !== bGroup.layer) {
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
  if (parent.layer === child.layer) {
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
  for (let y = 0; y < child.transformedShape.length; y++) {
    const row = child.transformedShape[y];
    const pRow = parent.transformedShape[y + offset[1]];

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
  tile: Tile,
  excludedTileGroup: TileGroup[] = []
): boolean {
  const newGroup = makeTileGroup(
    tile,
    tileGroup.transformedShape,
    tileGroup.rotatable,
    tileGroup.layer
  );

  for (const g of tileScene.tileGroups.keys()) {
    if (
      g !== tileGroup &&
      excludedTileGroup.indexOf(g) === -1 &&
      tileGroupCollisionTest(g, newGroup)
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('collision detected');
      }

      return false;
    }

    if (tileGroup.children.length) {
      for (const cg of tileGroup.children) {
        const newTile = addVector2(tile, getTileGroupsOffset(tileGroup, cg));

        if (!canTileGroupMoveToTile(tileScene, cg, newTile, tileGroup.children)) {
          return false;
        }
      }
    }
  }

  return true;
}

export function dragTileGroupToPosition(
  tileScene: TileScene,
  tileGroup: TileGroup,
  pos: Vector2
): void {
  const el = tileScene.tileGroups.get(tileGroup);

  if (el) {
    transformTranslate(el, pos);

    if (tileGroup.children.length > 0) {
      const children = tileGroup.children.map(g => ({
        el: tileScene.tileGroups.get(g),
        offset: getPositionForTile(tileScene, getTileGroupsOffset(tileGroup, g))
      }));

      for (const c of children) {
        if (c.el && c.offset) {
          transformTranslate(c.el, addVector2(pos, c.offset));
        }
      }
    }
  }
}

export function rotateTileGroup(tileGroup: TileGroup): void {
  if (tileGroup.rotatable) {
    tileGroup.rotate = (tileGroup.rotate + 90) % 360;
  }
}
