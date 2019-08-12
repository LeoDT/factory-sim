import { interval } from 'rxjs';

export const CYCLE_TIME = 200;
export const globalClock = interval(CYCLE_TIME);

export const DRAW_TIME = 100;
export const drawClock = interval(DRAW_TIME);
