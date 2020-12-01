define(['exports'], function (_exports) {
  'use strict';

  Object.defineProperty(_exports, '__esModule', {
    value: true,
  });
  _exports.default = void 0;

  function Keyboard() {}

  var _default = Keyboard;
  _exports.default = _default;

  if (_default.constructor.name === 'Object') {
    _exports = Object.assign(_exports, _default);
  }

  if (_default.constructor.name === 'Function') {
    return _default;
  }

  if (['Function', 'Object'].indexOf(_default.constructor.name) === -1) {
    console.warn('Unrecognised export type, the module might not work in AMD environment:', _default);
  }
});
