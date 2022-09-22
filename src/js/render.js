// Math display engine integration
// =============================================================================
import settings from './settings';
import { coverObject, unescapeHtml } from './tools';

const latexRender = Object;
latexRender.prepareContent = (content, latex) => { return content; };
latexRender.prepareRender = () => {};
latexRender.renderElement = (element, displayMode) => {};

const addReferenceJump = (element) => {
  const elements = element.querySelectorAll('docsify-latex a[href]');
  if (elements === null) {
    return;
  }
  for (const linkElement of elements) {
    const refId = decodeURIComponent(linkElement.getAttribute('href')).substring(1);
    linkElement.onclick = () => {
      document.getElementById(refId).scrollIntoView();
      return false;
    };
  }
};

// - MathJax (V2, V3)
if (typeof MathJax !== 'undefined' && MathJax) {
  // MathJax configs and functions init
  if (MathJax.version[0] === '3') {
    coverObject(settings.customOptions, MathJax.config);
    // Prevent inconsistency render symbol problem
    MathJax.config.tex.inlineMath = settings.inlineMath;
    MathJax.config.tex.displayMath = settings.displayMath;
    MathJax.startup.getComponents();
    latexRender.prepareRender = () => {
      MathJax.startup.defaultReady();
      MathJax.startup.output.clearCache();
    };
    latexRender.renderElement = (element, displayMode) => {
      MathJax.typesetPromise([element])
        .then(() => {
          addReferenceJump(element);
        });
    };
  } else if (MathJax.version[0] === '2') {
    const options = {
      skipStartupTypeset: true,
      messageStyle: 'none'
    };
    coverObject(settings.customOptions, options);
    // Prevent inconsistency render symbol problem
    coverObject({
      tex2jax: {
        inlineMath: settings.inlineMath,
        displayMath: settings.displayMath
      }
    }, options);
    MathJax.Hub.Config(options);
    MathJax.Hub.processSectionDelay = 0;
    MathJax.Hub.processUpdateDelay = 0;
    latexRender.prepareRender = () => {
      MathJax.Hub.Queue(
        ['PreProcess',MathJax.Hub],
        ['resetEquationNumbers',MathJax.InputJax.TeX],
        ['PreProcess',MathJax.Hub],
        ['Reprocess',MathJax.Hub]
      );
    };
    latexRender.renderElement = (element, displayMode) => {
      MathJax.Hub.Queue(
        ['Typeset', MathJax.Hub, element],
        [addReferenceJump, element]
      );
    };
  }
}
// - KaTeX
else if (typeof katex !== 'undefined' && katex) {
  const options = {
    throwOnError: false,
    trust: (context) => ['\\htmlId', '\\href'].includes(context.command),
    macros: {
      '\\eqref': '\\href{##ktx-#1}{(\\text{#1})}',
      '\\ref': '\\href{##ktx-#1}{\\text{#1}}',
      '\\label': '\\htmlId{ktx-#1}{}'
    }
  };
  coverObject(settings.customOptions, options);

  latexRender.prepareContent = (_content, latex) => { return latex; };
  latexRender.renderElement = (element, displayMode) => {
    options.displayMode = displayMode;
    element.innerHTML = katex.renderToString(unescapeHtml(element.innerHTML), options);
    addReferenceJump(element);
  };
}

export default latexRender;
