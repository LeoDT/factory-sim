import { observable, IObservableObject } from 'mobx';

export type Tile = Vector2;

export interface TileArea {
  lt: Tile; // left top tile
  rb: Tile; // right bottom tile
}

export interface TileGroup {
  tile: Tile;
  areas: TileArea[];
}

export interface TileScene extends IObservableObject {
  tileSize: number;

  tileGroups: TileGroup[];
}

export function makeTile(x: number, y: number): Tile {
  return [x, y];
}

export function makeTileGroup(tile: Tile, areas: TileArea[]): TileGroup {
  return {
    tile,
    areas
  };
}

export function makeTileScene(tileSize: number): TileScene {
  return observable.object(
    {
      tileSize,

      tileGroups: []
    },
    {},
    {
      deep: false
    }
  );
}

export function getSnappedPosition(tileScene: TileScene, position: Vector2): Vector2 {
  const { tileSize } = tileScene;
  const [x, y] = position;

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

export function getTileGroupSize(tileScene: TileScene, tileGroup: TileGroup): Vector2 {
  const { tileSize } = tileScene;
  const { areas } = tileGroup;

  if (areas.length < 1) throw new Error('tile group must have 1 tile area at least');

  let leftTop: Vector2 = areas[0].lt;
  let rightBottom: Vector2 = areas[0].rb;

  areas.forEach(({ lt, rb }) => {
    if (lt[0] < leftTop[0] || lt[1] < leftTop[1]) {
      leftTop = lt;
    }

    if (rb[0] > rightBottom[0] || rb[1] > rightBottom[1]) {
      rightBottom = rb;
    }
  });

  return [
    (rightBottom[0] - leftTop[0] + 1) * tileSize,
    (rightBottom[1] - leftTop[1] + 1) * tileSize
  ];
}
