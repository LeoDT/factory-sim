import { interval } from 'rxjs';

export const CYCLE_TIME = 200;
export const globalClock = interval(CYCLE_TIME);
