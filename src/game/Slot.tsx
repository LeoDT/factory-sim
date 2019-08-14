import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Slot } from '../core/slot';

interface Props {
  slot: Slot;
}

export default function Slot({ slot }: Props): JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <div
      className="m-1 border border-gray-300 relative h-10 w-10 text-center bg-gray-100"
      ref={ref}
    >
      <Observer>
        {() => (
          <>
            {slot.resource ? (
              <>
                <div className="text-2xl">{slot.resource.resourceType.icon}</div>
                <div className="absolute text-xs bottom-0 right-0 font-mono">
                  {slot.resource.amount}
                </div>
              </>
            ) : null}
          </>
        )}
      </Observer>
    </div>
  );
}
