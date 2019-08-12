import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Slot } from '../slot';
import { useStore } from './store';

interface Props {
  slot: Slot;
}

export default function Slot({ slot }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const store = useStore();

  React.useEffect(() => {
    if (ref.current) {
      store.updateSlotUIElement(slot, ref.current);
    }
  });

  return (
    <div className="p-1 m-1 border border-gray-300" ref={ref}>
      <Observer>
        {() => (
          <div className="h-6">
            {slot.resource ? `${slot.resource.resourceType.name} - ${slot.resource.amount}` : null}
          </div>
        )}
      </Observer>
    </div>
  );
}
