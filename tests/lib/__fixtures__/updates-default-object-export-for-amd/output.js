define(['exports'], function (_exports) {
  'use strict';

  Object.defineProperty(_exports, '__esModule', {
    value: true,
  });
  _exports.default = void 0;
  const obj = {
    foo: 'foo',
    bar: 'bar',
  };
  var _default = obj;
  _exports.default = _default;

  if (_default.constructor.name === 'Object') {
    _exports = Object.assign(_exports, _default);
  }

  if (_default.constructor.name === 'Function') {
    return _default;
  }
});
