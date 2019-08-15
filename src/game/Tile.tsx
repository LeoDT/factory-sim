import * as React from 'react';

import { TileGroup, getTileGroupSize } from '~core/tile';

import { useTileScene } from './context';
import { useDragInTileScene } from './hooks/useDragInTileScene';

interface Props {
  children: JSX.Element | null;
  tileGroup: TileGroup;
}

export default function Tile({ children, tileGroup }: Props): JSX.Element {
  const tileScene = useTileScene();
  const size = React.useMemo(() => getTileGroupSize(tileScene, tileGroup), [tileGroup]);

  const ref = React.useRef<HTMLDivElement | null>(null);
  const dragBind = useDragInTileScene(ref);

  return (
    <div
      className="p-3 border border-indigo-200 bg-white rounded fixed top-0 left-0"
      style={{ width: size[0], height: size[1] }}
      ref={ref}
      {...dragBind()}
    >
      {children}
    </div>
  );
}
