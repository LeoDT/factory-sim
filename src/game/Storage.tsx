import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Storage } from '~core/storage';

import Port from './Port';
import TileGroup from './Tile/TileGroup';
import { useStore } from './context';

interface Props {
  storage: Storage;
}

export default function Storage({ storage }: Props): JSX.Element {
  const { ui } = useStore();

  return (
    <Observer>
      {() => (
        <TileGroup
          tileGroup={storage.tileGroup}
          onDragStart={e => {
            if (e) {
              ui.select(storage, e.currentTarget);
            }
          }}
          highlight={ui.selected.get() === storage}
        >
          <div>
            <div className="flex justify-center">
              <Port port={storage.port} type="all" />
            </div>
          </div>
        </TileGroup>
      )}
    </Observer>
  );
}
