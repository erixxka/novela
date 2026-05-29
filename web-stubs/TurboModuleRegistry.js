'use strict';
// Web stub: TurboModuleRegistry has no native modules on web.
// Returns a recursive no-op proxy so that any chain like
// module.getConstants().SomeKey won't throw — each call/access
// returns another callable proxy rather than undefined.
function noopProxy() {
  return new Proxy(
    function noopFn() {},
    {
      get: (_target, prop) => {
        if (prop === 'then' || typeof prop === 'symbol') return undefined;
        return noopProxy();
      },
      apply: () => noopProxy(),
      construct: () => noopProxy(),
    }
  );
}

module.exports = {
  get: (_name) => null,
  getEnforcing: (_name) => noopProxy(),
};
