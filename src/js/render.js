// Math display engine integration
// =============================================================================
import settings from './settings';
import { coverObject, unescapeHtml } from './tools';

const latexRender = Object;
latexRender.prepareContent = (content, latex) => { return content; };
latexRender.renderElement = (element, displayMode) => {};

// - MathJax (V2, V3)
if (typeof MathJax !== 'undefined' && MathJax) {
  const addClickJump = (parentNodeName, element) => {
    const elements = element.querySelectorAll(`${parentNodeName} a[href]`);
    if (elements === null) {
      return;
    }
    for (const element of elements) {
      const refId = decodeURIComponent(element.getAttribute('href')).substring(1);
      element.onclick = () => {
        document.getElementById(refId).scrollIntoView();
        return false;
      };
    }
  };
  // MathJax configs and functions init
  if (MathJax.version[0] === '3') {
    coverObject(settings.customOptions, MathJax.config);
    // Prevent inconsistency render symbol problem
    MathJax.config.tex.inlineMath = settings.inlineMath;
    MathJax.config.tex.displayMath = settings.displayMath;
    MathJax.startup.getComponents();

    latexRender.renderElement = (element, displayMode) => {
      MathJax.typesetPromise([element])
        .then(() => {
          addClickJump('mjx-math', element);
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

    latexRender.renderElement = (element, displayMode) => {
      MathJax.Hub.Queue(
        ['Typeset', MathJax.Hub, element],
        [addClickJump, 'docsify-latex', element]
      );
    };
  }
}
// - KaTeX
else if (typeof katex !== 'undefined' && katex) {
  const options = {
    throwOnError: false
  };
  coverObject(settings.customOptions, options);

  latexRender.prepareContent = (_content, latex) => { return latex; };
  latexRender.renderElement = (element, displayMode) => {
    options.displayMode = displayMode;
    element.innerHTML = katex.renderToString(unescapeHtml(element.innerHTML), options);
  };
}

export default latexRender;
