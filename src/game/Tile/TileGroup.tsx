import classnames from 'classnames';
import * as React from 'react';
import { TransformedEvent } from 'react-use-gesture/dist/types';

import { TileGroup, getTileGroupSize } from '~core/tile';

import { useTileScene } from '../context';
import { useDragInTileScene } from '../hooks/useDragInTileScene';

import TileArea from './TileArea';

interface Props {
  children: JSX.Element | null;
  tileGroup: TileGroup;
  highlight?: boolean;

  onDragStart?: (e?: TransformedEvent) => void;
}

export default function Tile({
  children,
  tileGroup,
  highlight = false,
  onDragStart
}: Props): JSX.Element {
  const tileScene = useTileScene();
  const size = React.useMemo(() => getTileGroupSize(tileScene, tileGroup), [tileScene, tileGroup]);
  const [canDrop, setCanDrop] = React.useState(true);
  const [dragging, setDragging] = React.useState(false);

  const ref = React.useRef<HTMLDivElement | null>(null);
  const dragBind = useDragInTileScene(ref, tileGroup, {
    onDragStart: e => {
      if (onDragStart) {
        onDragStart(e);
      }

      setDragging(true);
    },
    onDrag: (c: boolean) => {
      if (c !== canDrop) {
        setCanDrop(c);
      }
    },
    onDragEnd: () => {
      setDragging(false);
    },
    onDropSuccess: (tile: Vector2) => {
      tileGroup.tile = tile;
    },
    onDropReset: () => {
      if (!canDrop) {
        setCanDrop(true);
      }
    }
  });

  React.useEffect(() => {
    tileScene.tileGroups.push(tileGroup);

    return () => {
      tileScene.tileGroups.remove(tileGroup);
    };
  }, [tileGroup]);

  return (
    <div
      className={classnames(
        'fixed top-0 left-0',
        canDrop ? 'border-indigo-200' : 'border-red-500',
        { 'z-40 opacity-50': dragging, 'shadow-outline1': highlight }
      )}
      style={{ width: size[0], height: size[1] }}
      ref={ref}
    >
      <div className="absolute top-0 left0">
        {tileGroup.areas.map((a, i) => (
          <TileArea area={a} key={i} dragBind={dragBind} />
        ))}
      </div>
      {children}
    </div>
  );
}
