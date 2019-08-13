import * as React from 'react';
import { Observer } from 'mobx-react-lite';
import { Storage } from '~core/storage';
import Slot from './Slot';
import { useStore } from './store';

interface Props {
  storage: Storage;
}

export default function Storage({ storage }: Props) {
  const store = useStore();

  return (
    <div className="p-3 border border-indigo-200	bg-white rounded m-3">
      <h4 className="text-xl">{storage.storageType.name}</h4>
      <div className="mt-3 flex justify-center">
        <div
          className="h-2 w-2 bg-red-300 rounded-full"
          ref={c => {
            if (c) store.updatePortUIElement(storage.port, c);
          }}
        />
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
