// 1. find to `exports.default`
// 2. find to all Expression(`exports.default`, `exports.foo` etc)
// 3. add `module.exports` if exists only `exports.default` assignment
// The above works after executing `preset-env`(transform-es2015-modules-*) in `Plugin.post`

module.exports = ({ template, types: t }) => {
  let pluginOptions;

  function addModuleExportsDefaults(path) {
    const finder = new ExportsFinder(path);
    if (!finder.isOnlyExportsDefault() || !finder.isAmd()) {
      return;
    }

    if (
      t.isUnaryExpression(path.get('right').node, { operator: 'void' }) &&
      t.isNumericLiteral(path.get('right').node.argument, { value: 0 })
    ) {
      return;
    }

    let replacements = [];

    const propertyName = path.get('left').node.property.name;
    const exportName = path.get('left').node.object.name;

    replacements.push(
      template(`
        if (typeof IMPORT === "object" && IMPORT) {
          EXPORT = Object.assign(EXPORT, IMPORT); 
        }`)({ EXPORT: exportName, IMPORT: `${exportName}.${propertyName}` })
    );

    replacements.push(
      template(`
        if (typeof IMPORT === "function") {
          return IMPORT;
        }`)({ IMPORT: `${exportName}.${propertyName}` }),
    );

    if (pluginOptions.addConsoleWarn) {
      replacements.push(
        template(`
          if (['function', 'object'].indexOf(typeof IMPORT) === -1) {
            console.warn('Unrecognised export type, the module might not work in AMD environment:', IMPORT);
          }`)({ IMPORT: `${exportName}.${propertyName}` }),
      );
    }

    finder.getRootPath(path).pushContainer('body', replacements);
  }

  const ExportsDefaultVisitor = {
    CallExpression(path) {
      if (!path.get('callee').matchesPattern('Object.defineProperty')) {
        return;
      }

      const [identifier, prop] = path.get('arguments');
      const objectName = identifier.get('name').node;
      const propertyName = prop.get('value').node;

      if ((objectName === 'exports' || objectName === '_exports') && propertyName === 'default') {
        addModuleExportsDefaults(path);
      }
    },
    AssignmentExpression(path) {
      if (path.get('left').matchesPattern('exports.default') || path.get('left').matchesPattern('_exports.default')) {
        addModuleExportsDefaults(path);
      }
    },
  };

  return {
    name: 'squla-babel-default-amd-export-fix',

    visitor: {
      Program(path, state) {
        pluginOptions = state.opts;
      }
    },

    post(fileMap) {
      fileMap.path.traverse(ExportsDefaultVisitor);
    },
  };
};

class ExportsFinder {
  constructor(exportsDefaultPath) {
    this.path = exportsDefaultPath;
    this.hasExportsDefault = false;
    this.hasExportsNamed = false;
    this.hasModuleExports = false;
  }

  getRootPath() {
    return this.path.findParent((path) => {
      return path.key === 'body' || !path.parentPath;
    });
  }

  isOnlyExportsDefault() {
    this.getRootPath()
      .get('body')
      .forEach((path) => {
        if (path.isVariableDeclaration()) {
          this.findExports(path.get('declarations.0'), 'init');
        } else if (path.isExpressionStatement() && path.get('expression').isAssignmentExpression()) {
          this.findExports(path);
        } else {
          this.findExportsInCallExpression(path);
        }
      });
    return this.hasExportsDefault && !this.hasExportsNamed && !this.hasModuleExports;
  }

  findExports(path, property = 'expression') {
    // Not `exports.anything`, skip
    if (
      !path.get(`${property}`).node ||
      !path.get(`${property}.left`).node ||
      !path.get(`${property}.left.object`).node
    ) {
      return;
    }

    const objectName = path.get(`${property}.left.object.name`).node;
    const propertyName = path.get(`${property}.left.property.name`).node;
    if (objectName === 'exports' || objectName === '_exports') {
      if (propertyName === 'default') {
        this.hasExportsDefault = true;
      } else if (propertyName !== '__esModule') {
        this.hasExportsNamed = true;
      }
    }
    if (`${objectName}.${propertyName}` === 'module.exports') {
      this.hasModuleExports = true;
    }
  }

  findExportsInCallExpression(path) {
    const self = this;
    path.traverse({
      CallExpression(path) {
        if (!path.get('callee').matchesPattern('Object.defineProperty')) {
          return;
        }

        const [identifier, prop] = path.get('arguments');
        const objectName = identifier.get('name').node;
        const propertyName = prop.get('value').node;

        if ((objectName === 'exports' || objectName === '_exports') && propertyName !== '__esModule') {
          if (propertyName === 'default') {
            self.hasExportsDefault = true;
          } else {
            self.hasExportsNamed = true;
          }
        }
      },
    });
  }

  isAmd() {
    const rootPath = this.getRootPath();
    const hasntAmdRoot = !(rootPath.parentPath && rootPath.parentPath.parentPath);
    if (hasntAmdRoot) {
      return false;
    }

    const amdRoot = rootPath.parentPath.parentPath;
    if (!amdRoot.isCallExpression()) {
      return false;
    }

    return amdRoot.get('callee.name').node === 'define';
  }
}
