import {computed, CreateComputedOptions, effect, signal, Signal} from '@angular/core';
import {Subject} from 'rxjs';

export function lastValueDelayed<T>(computation: () => T, delayMs: number): Signal<T> {
  const r = signal<T>(computation());
  let t: NodeJS.Timeout | null = null;
  effect(() => {
    const v = computation();
    if(t) {
      clearTimeout(t);
      t = null;
    }
    t = setTimeout(() => r.set(v), delayMs);
  });
  return r;
}
