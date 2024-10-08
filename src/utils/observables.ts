import { Observable, Subject, BehaviorSubject, EMPTY, fromEvent } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export function pausableObservable<T>(
  source: Observable<T>,
  defaultPaused: boolean = false
): { pausable: Observable<T>; pause: () => void; resume: () => void } {
  const pauser = new BehaviorSubject<boolean>(defaultPaused);
  const sourceSubject = new Subject<T>();
  const pausable = pauser.pipe(switchMap(paused => (paused ? EMPTY : sourceSubject)));

  source.subscribe(sourceSubject);

  return {
    pausable,
    pause: () => {
      pauser.next(true);
    },
    resume: () => {
      pauser.next(false);
    }
  };
}

export function windowResize(): BehaviorSubject<Event | null> {
  const resize = fromEvent(window, 'resize');
  const behavior = new BehaviorSubject<Event | null>(null);

  resize.subscribe(behavior);

  return behavior;
}
