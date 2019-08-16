import { observable, IObservableObject, IObservableArray } from 'mobx';
import { clamp } from '~utils/numbers';

export type Tile = Vector2;

export interface TileArea {
  lt: Tile; // left top tile
  rb: Tile; // right bottom tile
}

export interface TileGroup {
  tile: Tile;
  areas: TileArea[];
  mergedArea: TileArea;
}

export interface TileScene extends IObservableObject {
  tileSize: number;

  tileGroups: IObservableArray<TileGroup>;
}

export function makeTile(x: number, y: number): Tile {
  return [x, y];
}

export function makeTileGroup(tile: Tile, areas: TileArea[]): TileGroup {
  return {
    tile,
    areas,
    mergedArea: mergeTileAreas(areas)
  };
}

export function makeTileScene(tileSize: number): TileScene {
  return observable.object(
    {
      tileSize,

      tileGroups: observable.array([], { deep: false })
    },
    {},
    {
      deep: false
    }
  );
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

export function mergeTileAreas(areas: TileArea[]): TileArea {
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

  return { lt: leftTop, rb: rightBottom };
}

export function getTileGroupSize(tileScene: TileScene, tileGroup: TileGroup): Vector2 {
  return getTileAreaTileSize(tileGroup.mergedArea).map(d => d * tileScene.tileSize) as Vector2;
}

export function tileGroupCollisionTest(a: TileGroup, b: TileGroup): boolean {
  return (
    a.tile[0] < b.tile[0] + b.mergedArea.rb[0] + 1 &&
    a.tile[0] + a.mergedArea.rb[0] + 1 > b.tile[0] &&
    a.tile[1] < b.tile[1] + b.mergedArea.rb[1] + 1 &&
    a.tile[1] + a.mergedArea.rb[1] + 1 > b.tile[1]
  );
}

export function canTileGroupMoveToTile(
  tileScene: TileScene,
  tileGroup: TileGroup,
  tile: Tile
): boolean {
  const newGroup = { ...tileGroup, tile };

  return !tileScene.tileGroups.some(g => g !== tileGroup && tileGroupCollisionTest(g, newGroup));
}
