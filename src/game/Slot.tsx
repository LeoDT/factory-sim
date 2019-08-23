import './Slot.scss';

import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Slot } from '../core/slot';
import TileGroup from './Tile/TileGroup';
import { useTileScene, useStore } from './context';

interface Props {
  slot: Slot;
  isTile?: boolean;
}

export default function Slot({ slot, isTile = true }: Props): JSX.Element {
  const store = useStore();
  const tileScene = useTileScene();

  const slotEl = (
    <div className="slot" style={{ width: tileScene.tileSize, height: tileScene.tileSize }}>
      <Observer>
        {() => (
          <>
            {slot.resource ? (
              <>
                <div className="icon">{slot.resource.resourceType.icon}</div>
                <div className="amount">{slot.resource.amount}</div>
              </>
            ) : null}
          </>
        )}
      </Observer>
    </div>
  );

  if (isTile) {
    return (
      <TileGroup
        className="slot-tile-group"
        tileGroup={slot.tileGroup}
        onDragSuccess={() => {
          store.checkThingInBoards(slot);
        }}
      >
        {slotEl}
      </TileGroup>
    );
  }

  return slotEl;
}
