import { observable, action, IObservableObject } from 'mobx';

export interface Cycler extends IObservableObject {
  counter: number;
  cycle: number;
  state: CyclerState;
  tick: () => void;
}

export type CyclerState = 'IDLE' | 'BUSY' | 'FINISH';

const START = 1;

export function makeCycler(cycle: number): Cycler {
  const cycler = observable.object(
    {
      cycle,
      counter: START,
      tick: () => {
        let count = cycler.counter + 1;
        if (count > cycler.cycle) {
          count = START;
        }
        cycler.counter = count;
      },
      get state(): CyclerState {
        return getCyclrState(cycler);
      }
    },
    { tick: action },
    { deep: false }
  );

  return cycler;
}

export function getCyclrState(cycler: Cycler): CyclerState {
  switch (cycler.counter) {
    case START:
      return 'IDLE';
    case cycler.cycle:
      return 'FINISH';
    default:
      return 'BUSY';
  }
}
