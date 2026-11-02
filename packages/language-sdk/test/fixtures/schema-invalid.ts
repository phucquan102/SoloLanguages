import { makeModule } from './valid.ts';

const base = makeModule('qsc');
export default { ...base, manifest: { ...base.manifest, scripts: [] }, textTools: { normalize: 'not a function' } };
