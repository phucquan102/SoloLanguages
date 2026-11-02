type Timers = { setTimeout(cb: () => void, ms: number): unknown; clearTimeout(handle: unknown): void };
const timers = globalThis as unknown as Timers;

/** Internal. Rejects after `ms`; the timer is always cleared. Cannot interrupt synchronous loops. */
export function withTimeout<T>(run: () => Promise<T> | T, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const handle = timers.setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    Promise.resolve()
      .then(run)
      .then(resolve, reject)
      .finally(() => timers.clearTimeout(handle));
  });
}
