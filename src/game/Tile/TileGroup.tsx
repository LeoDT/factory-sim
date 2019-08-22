import './TileGroup.scss';

import classnames from 'classnames';
import * as React from 'react';
import { TransformedEvent } from 'react-use-gesture/dist/types';

import { TileGroup } from '~core/tile';

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
      className={classnames('tile-group', {
        'can-not-drop': !canDrop,
        dragging,
        highlight
      })}
      ref={ref}
    >
      <div className="tile-areas">
        {tileGroup.areas.map((a, i) => (
          <TileArea area={a} key={i} dragBind={dragBind} />
        ))}
      </div>
      {children}
    </div>
  );
}
