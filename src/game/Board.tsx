import './Board.scss';

import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Board } from '~core/board';

import TileGroup from './Tile/TileGroup';
import { useStore } from './context';

interface Props {
  board: Board;
}

export default function Board({ board }: Props): JSX.Element {
  const { ui } = useStore();

  return (
    <Observer>
      {() => (
        <TileGroup
          className="board-tile-group"
          tileGroup={board.tileGroup}
          onDragStart={e => {
            if (e) {
              ui.select(board, e.currentTarget);
            }
          }}
          highlight={ui.selected.get() === board}
        />
      )}
    </Observer>
  );
}
