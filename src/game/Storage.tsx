import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Storage } from '~core/storage';

import { useDragInTileScene } from './hooks/useDragInTileScene';

import Slot from './Slot';
import Port from './port';

interface Props {
  storage: Storage;
}

export default function Storage({ storage }: Props): JSX.Element {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const dragBind = useDragInTileScene(ref);

  return (
    <div
      className="p-3 border border-indigo-200 bg-white rounded fixed top-0 left-0"
      ref={ref}
      {...dragBind()}
    >
      <h4 className="text-xl">{storage.storageType.name}</h4>
      <div className="mt-3 flex justify-center">
        <Port port={storage.port} type="all" />
      </div>
      <div className="flex mt-3 flex-wrap">
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
  );
}
