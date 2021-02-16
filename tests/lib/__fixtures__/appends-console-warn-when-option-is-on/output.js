define(['exports'], function (_exports) {
  'use strict';

  Object.defineProperty(_exports, '__esModule', {
    value: true,
  });
  _exports.default = void 0;

  function Keyboard() {}

  var _default = Keyboard;
  _exports.default = _default;

  if (typeof _default === 'object' && _default) {
    _exports = Object.assign(_exports, _default);
  }

  if (typeof _default === 'function') {
    return _default;
  }

  if (['function', 'object'].indexOf(typeof _default) === -1) {
    console.warn('Unrecognised export type, the module might not work in AMD environment:', _default);
  }
});
