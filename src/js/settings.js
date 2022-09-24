import { version as pkgVersion } from '../../package.json';
import { coverObject } from './tools';

// Settings
// =============================================================================
const settings = {
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$']],
  overflowScroll: true,
  beforeInitFunc: () => {},
  customOptions: {},
};

if (window) {
  window.$docsify = window.$docsify || {};

  // Add config object
  window.$docsify.latex = window.$docsify.latex || {};

  // Update settings based on $docsify config
  coverObject(window.$docsify.latex, settings);
  // Add plugin data
  window.$docsify.latex.version = pkgVersion;
}

export default settings;
