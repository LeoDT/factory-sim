import * as React from 'react';

import { Tile } from '~core/tile';
import { useTileScene } from '~game/context';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';

interface Props {
  tile: Tile;
  dragBind: () => ReactEventHandlers;
}

export default function TileBlock({ tile, dragBind }: Props): JSX.Element {
  const tileScene = useTileScene();
  const dimension = React.useMemo(() => {
    const offsetX = tile[0] * tileScene.tileSize;
    const offsetY = tile[1] * tileScene.tileSize;

    return { offsetX, offsetY };
  }, [tileScene, tile]);

  return (
    <div
      className="tile-area tile-block"
      {...dragBind()}
      style={{
        width: tileScene.tileSize,
        height: tileScene.tileSize,
        transform: `translate3D(${dimension.offsetX}px, ${dimension.offsetY}px, 0)`
      }}
    />
  );
}
