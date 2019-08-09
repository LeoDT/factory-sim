import { interval } from 'rxjs';

export const CYCLE_TIME = 1000;
export const globalClock = interval(CYCLE_TIME);
