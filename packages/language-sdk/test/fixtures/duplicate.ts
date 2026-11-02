import { makeModule } from './valid.ts';

/** Same manifest.code as valid.ts. */
export default makeModule('qtv', { manifest: { ...makeModule().manifest, nativeName: 'Duplicate' } });
