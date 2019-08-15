import { observable, IObservableObject } from 'mobx';

export interface Tile {
  x: number;
  y: number;
}

export interface TileArea {
  lt: Tile; // left top tile
  rb: Tile; // right bottom tile
}

export interface TileGroup {
  tiles: Array<Tile | TileArea>;
}

export interface TileScene extends IObservableObject {
  tileSize: number;

  tileGroups: TileGroup[];
}

export function makeTile(x: number, y: number): Tile {
  return { x, y };
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

  return [Math.floor(x / tileSize), Math.floor(y / tileSize)];
}

export function getPositionForTile(tileScene: TileScene, tile: Tile): Vector2 {
  const { tileSize } = tileScene;

  return [tile.x * tileSize, tile.y * tileSize];
}

export function getTileForPosition(tileScene: TileScene, position: Vector2): Tile {
  const [x, y] = getSnappedPosition(tileScene, position);

  return makeTile(x, y);
}
