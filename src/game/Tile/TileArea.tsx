import * as React from 'react';

import { TileArea, getTileAreaSize } from '~core/tile';
import { useTileScene } from '~game/context';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';

interface Props {
  area: TileArea;
  dragBind: () => ReactEventHandlers;
}

export default function TileArea({ area, dragBind }: Props): JSX.Element {
  const tileScene = useTileScene();
  const dimension = React.useMemo(() => {
    const size = getTileAreaSize(tileScene, area);
    const offsetX = area.lt[0] * tileScene.tileSize;

    return { size, offsetX };
  }, [tileScene, area]);

  return (
    <div
      className="tile-area"
      {...dragBind()}
      style={{
        width: dimension.size[0],
        height: dimension.size[1],
        transform: `translateX(${dimension.offsetX}px)`
      }}
    />
  );
}
