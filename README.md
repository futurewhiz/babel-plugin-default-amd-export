Babel plugin to make default ES6 export compatible with AMD-style modules.

### Problem

Default exports from ES6 after babel transpilation are available under "default" prefix:

```javascript
var EventBus = require('components/helpers/EventBus');
...
EventBus.default.$emit('hud.showError', errorData);
```

But we have a lot of code in webarcade built in ES5 with AMD-style modules in mind which expects exported dependencies to be directly available without extra prefixes. In case we convert more core modules to ES6, every place has to be updated to include the prefix.

### Solution

Plugin hooks into Babel post-process state to detect default ES6 exports and
appends runtime expressions to make those exports available to ES5 code written in AMD-style.

At the moment only Object and Function exports supported. Runtime expressions depend on export type.

For Object it is:

```javascript
if (_default.constructor.name === 'Object') {
  _exports = Object.assign(_exports, _default);
}
```

For Function:

```javascript
if (_default.constructor.name === 'Function') {
  return _default;
}
```

Plugin supports "addConsoleWarn" config option to generate logging statement for unsupported export types:

```javascript
  if (['Function', 'Object'].indexOf(_default.constructor.name) === -1) {
    console.warn('Unrecognised export type, the module might not work in AMD environment:', _default);
  }
```

### Testing

Tests are written for Jest test framework with "babel-plugin-tester" plugin:

`npm run test`
