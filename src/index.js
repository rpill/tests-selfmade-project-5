import path from 'path';
import {
  launchBrowser,
  compareLayout,
  runTests,
  mkdir,
  mkfile,
  structure,
  stylelint,
  orderStyles,
  lang,
  titleEmmet,
} from 'lib-verstka-tests';
import ru from './locales/ru.js';
import {
  styles,
  pseudoElements,
} from './tests.js';

const [, , PROJECT_PATH, LANG = 'ru'] = process.argv;

const app = async (projectPath, lng) => {
  const options = {
    projectPath,
    lang: lng,
    resource: ru,
  };

  const check = async () => {
    const tree = mkdir('project', [
      mkfile('index.html'),
      mkdir('styles', [
        mkfile('style.css'),
      ]),
      mkdir('fonts', [
        mkfile('fonts.css'),
      ]),
      mkdir('scripts', []),
    ]);
    const structureErrors = structure(projectPath, tree);

    if (structureErrors.length) {
      return structureErrors;
    }

    const indexPath = path.join(projectPath, 'index.html');
    const viewport = { width: 1550, height: 1080 };
    const launchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    const { browser, page } = await launchBrowser(indexPath, { launchOptions, viewport });
    const errors = (await Promise.all([
      stylelint(projectPath),
      orderStyles(page, ['fonts.css', 'style.css']),
      lang(page, lng),
      titleEmmet(page),
      styles(path.join(projectPath, 'styles', 'style.css'), 'styles|style.css'),
      pseudoElements(path.join(projectPath, 'styles', 'style.css')),
      compareLayout(indexPath, {
        canonicalImage: 'layout-canonical-1550.jpg',
        pageImage: 'layout-1550.jpg',
        outputImage: 'output-1550.jpg',
        browserOptions: { launchOptions, viewport: { width: 1550, height: 1080 } },
      }),
    ]))
      .filter(Boolean)
      .flat();

    await browser.close();

    return errors;
  };

  await runTests(options, check);
};

app(PROJECT_PATH, LANG);
