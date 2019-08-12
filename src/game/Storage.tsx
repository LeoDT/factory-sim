import * as React from 'react';
import { Observer } from 'mobx-react-lite';
import { Storage } from '~storage';
import Slot from './Slot';

interface Props {
  storage: Storage;
}

export default function Storage({ storage }: Props) {
  return (
    <div className="p-3 border border-indigo-200	bg-white rounded m-3">
      <h4 className="text-xl">{storage.storageType.name}</h4>
      <div className="flex mt-3">
        <div className="flex-grow">
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
    </div>
  );
}
