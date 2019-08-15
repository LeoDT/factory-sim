import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Storage } from '~core/storage';

import Slot from './Slot';
import Port from './port';
import Tile from './Tile';

interface Props {
  storage: Storage;
}

export default function Storage({ storage }: Props): JSX.Element {
  return (
    <Tile tileGroup={storage.tileGroup}>
      <div>
        <h4 className="text-xl hidden">{storage.storageType.name}</h4>
        <div className="flex justify-center">
          <Port port={storage.port} type="all" />
        </div>
        <div className="flex mt-3 flex-wrap hidden">
          <Observer>
            {() => (
              <>
                {storage.slots.map((slot, i) => (
                  <Slot key={i} slot={slot} />
                ))}
              </>
            )}
          </Observer>
        </div>
      </div>
    </Tile>
  );
}
