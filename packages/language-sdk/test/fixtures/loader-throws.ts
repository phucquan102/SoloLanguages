export function load(): Promise<unknown> {
  return Promise.reject(new Error('boom'));
}
