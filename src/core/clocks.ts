import { interval } from 'rxjs';
import { pausableObservable } from '~utils/observables';
import { sendToGlobals } from '~utils/debug';

export const CYCLE_TIME = 200;
export const {
  pausable: runClock,
  pause: pauseRunClock,
  resume: resumeRunClock
} = pausableObservable(interval(CYCLE_TIME));

sendToGlobals({
  runClock,
  pauseRunClock,
  resumeRunClock
});

export const DRAW_TIME = 100;
export const drawClock = interval(DRAW_TIME);
