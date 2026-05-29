'use strict';
// Web stub: BatchedBridge is the old-arch RN bridge — not used on web.
// Provide no-op methods so callers don't throw.
const noop = () => {};
module.exports = {
  registerCallableModule: noop,
  registerLazyCallableModule: noop,
  getCallableModule: () => null,
  enqueueNativeCall: noop,
  registerCallableModuleSynchronous: noop,
  receiveMessage: noop,
  callFunctionReturnFlushedQueue: () => [[], [], []],
  callFunctionReturnResultAndFlushedQueue: () => [null, [[], [], []]],
  flushedQueue: () => [[], [], []],
  callFunction: () => undefined,
  setReactNativeMicrotasksCallback: noop,
  spy: noop,
};
