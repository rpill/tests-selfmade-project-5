import fs from 'fs';
import * as csstree from 'css-tree';

const styles = async (stylesPath, fileName) => {
  const errors = [];

  const cssCode = fs.readFileSync(stylesPath, 'utf8');
  const ast = csstree.parse(cssCode);

  const declarations = csstree.findAll(ast, (node) => node.type === 'Declaration' && node.property === 'color');

  const vals = declarations.map(x => x.value.children.head.data);
  const vals1 = vals.filter(x => x.type !== 'Function');
  const vals2 = vals1.filter(x => x.type !== 'Identifier');
  const s = new Set(vals1.map(x => x.name));
  s.delete('currentColor');
  s.delete('inherit');
  if (vals2.length > 0 || s.size > 0) {
    errors.push({
      id: 'styles.color',
      values: {
        fileName
      }
    });
  }

  const funs = csstree.findAll(ast, (node) => node.type === 'Function' && node.name === 'clamp');
  if (funs.length === 0) {
    errors.push({
      id: 'styles.clamp',
      values: {
        fileName
      }
    });
  }

  const ar = csstree.findAll(ast, (node) => node.type === 'Declaration' && node.property === 'aspect-ratio');
  if (ar.length === 0) {
    errors.push({
      id: 'styles.ar',
      values: {
        fileName
      }
    });
  }

  const font = csstree.findAll(ast, (node) => node.type === 'Declaration' && node.property === '--main-font');
  if (font.length === 0) {
    errors.push({
      id: 'styles.main-font',
      values: {
        fileName
      }
    });
  }

  return errors;
};

const pseudoElements = (cssPath) => {
  const cssCode = fs.readFileSync(cssPath, 'utf8');
  const ast = csstree.parse(cssCode);

  const found = csstree.findAll(ast, (node) => node.type === 'PseudoClassSelector' || node.type === 'PseudoElementSelector');

  if (found.length < 3) {
    return [{ id: 'countPseudoElements' }];
  }

  return [];
};

export {
  styles,
  pseudoElements,
};
