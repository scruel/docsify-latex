// Dependencies
// =============================================================================
import { version as pkgVersion } from '../../package.json';


// Constants and variables
// =============================================================================
const settings = {
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$']],
};

if (window) {
  window.$docsify = window.$docsify || {};

  // Add config object
  window.$docsify.latex = window.$docsify.latex || {};

  // Update settings based on $docsify config
  Object.keys(window.$docsify.latex).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(settings, key)) {
      settings[key] = window.$docsify.latex[key];
    }
  });

  // Add plugin data
  window.$docsify.latex.version = pkgVersion;
}
// Base Tool Functions
// =============================================================================
function unescapeRegexEscape(regexStr) {
  return regexStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Math Render Init
// =============================================================================
let hasMathjax = (typeof MathJax !== 'undefined' && MathJax);
const hasKatex = (typeof katex !== 'undefined' && katex);

if (hasMathjax) {
  if (MathJax.version[0] === '3') {
    MathJax.config.tex.inlineMath = settings.inlineMath;
    MathJax.config.tex.displayMath = settings.displayMath;
    MathJax.startup.getComponents();

    MathJax.renderToStringAsync = async (content) => {
      const mathbox = document.createElement('div');
      mathbox.innerHTML = content;
      await new Promise((resolve, reject) => {
        MathJax.startup.promise
          .then(() => {
            MathJax.typesetPromise((() => {
              return [mathbox];
            })()
            );
            resolve();
          })
          .catch((err) => {
            console.log('Typeset failed: ' + err.message);
            reject(err);
          });
      });
      return mathbox.innerHTML;
    };
  } else if (MathJax.version[0] === '2') {
    MathJax.Hub.Config({
      tex2jax: {
        inlineMath: settings.inlineMath,
        displayMath: settings.displayMath
      },
      messageStyle: 'none'
    });
    MathJax.Hub.processUpdateDelay = 0;
    // Just let MathJax itself render the page :)
    hasMathjax = false;
  }
  else {
    hasMathjax = false;
  }
}

const commentReplaceMark = 'latex:replace';
const commentReplaceDollarMark = `<!-- ${commentReplaceMark} ESCAPEDOLLAR -->`;

const regex = {
  escapeDollarMarkup: /(\\\$)/g,

  // Matches markdown inline code
  // Example: `text`
  codeInlineMarkup: /((?!\\)`[\s\S]*?(?!\\)`)/g,

  // Matches markdown code blocks (inline and multi-line)
  // Example: ```text```
  codeBlockMarkup: /((?!\\)```[\s\S]*?(?!\\)```)/gm,

  // Matches replacement comment
  // 0: Match
  // 1: Replacement HTML
  commentReplaceMarkup: new RegExp(`<!-- ${commentReplaceMark} ([\\s\\S]*?) -->`),
  commentReplaceDollarMarkup: new RegExp(commentReplaceDollarMark),

};

async function renderMathContent(content, isInline) {
  if (hasMathjax) {
    return await MathJax.renderToStringAsync(content);
  } else if (hasKatex) {
    return katex.renderToString(content, {
      throwOnError: false,
      displayMode: !isInline,
    });
  } else {
    return content;
  }
}

function getRegexMarkup(matchStartRegex, matchEndRegex, isInline) {
  // Escape string according to regex syntax
  matchStartRegex = unescapeRegexEscape(matchStartRegex);
  matchEndRegex = unescapeRegexEscape(matchEndRegex);
  // Matches markdown inline math
  if (isInline) {
    return new RegExp(`(?<=^|(?:[^\\\\]))${matchStartRegex}(.*?)[^\\\\]?${matchEndRegex}`);
  }
  // Matches markdown math blocks
  return new RegExp(`(?<=^|(?:[^\\\\]))${matchStartRegex}([\\s\\S]*?)[^\\\\]?${matchEndRegex}`, 'm');
}

function matchMathBlock(content) {
  let isInline = false;
  for (const mathBlockArray of settings.displayMath) {
    const mathRegex = getRegexMarkup(mathBlockArray[0], mathBlockArray[1], isInline);
    let result = content.match(mathRegex);
    if (result) {
      result = result.concat(isInline);
      result = result.concat(mathRegex);
      return result;
    }
  }
  isInline = true;
  for (const mathBlockArray of settings.inlineMath) {
    const mathRegex = getRegexMarkup(mathBlockArray[0], mathBlockArray[1], isInline);
    let result = content.match(mathRegex);
    if (result) {
      result = result.concat(isInline);
      result = result.concat(mathRegex);
      return result;
    }
  }
}
/**
 * Converts LaTeX content into "stage 1" markup. Stage 1 markup contains temporary
 * comments which are replaced with HTML during Stage 2. This approach allows
 * all markdown to be converted to HTML before LaTeX-specific HTML is added.
 *
 * @param {string} content
 * @returns {string}
 */
async function renderStage1(content) {
  // Protect content:
  // Replace escaped char with marker to prevent wrong regex match.
  // Replace code block with marker to ensure LaTeX markup within code
  // blocks is not processed.
  // These markers are replaced with their associated code blocs after
  // blocks have been processed.
  // WARN: Do not change the order of matches!

  const escapeMatch = content.match(regex.escapeDollarMarkup) || [];
  escapeMatch.forEach((item) => {
    content = content.replace(item, () => commentReplaceDollarMark);
  });

  const codeBlockMatch = content.match(regex.codeBlockMarkup) || [];
  const codeBlockMarkers = codeBlockMatch.map((item, i) => {
    const codeMarker = `<!-- ${commentReplaceMark} CODEBLOCK${i} -->`;
    content = content.replace(item, () => codeMarker);
    return codeMarker;
  });
  const codeInlineMatch = content.match(regex.codeInlineMarkup) || [];
  const codeInlineMarkers = codeBlockMatch.map((item, i) => {
    const codeMarker = `<!-- ${commentReplaceMark} CODEINLINE${i} -->`;
    content = content.replace(item, () => codeMarker);
    return codeMarker;
  });

  // Render math blocks
  let mathMatch = matchMathBlock(content);
  while (mathMatch) {
    if ('' === mathMatch[0]) {
      throw new Error('Wrong regex match rule, please check!');
    }
    const mathBlockOut = await renderMathContent(mathMatch[0], mathMatch[2]);
    const mathBlockOutReplacement = `<!-- ${commentReplaceMark} ${window.btoa(encodeURIComponent(mathBlockOut))} -->`;
    content = content.replace(mathMatch[0], () => mathBlockOutReplacement);
    mathMatch = matchMathBlock(content);
  }

  // Unprotect content - restore code blocks
  codeBlockMarkers.forEach((item, i) => {
    content = content.replace(item, () => codeBlockMatch[i]);
  });
  codeInlineMarkers.forEach((item, i) => {
    content = content.replace(item, () => codeInlineMatch[i]);
  });
  return content;
}

/**
 * Converts "stage 1" markup into final markup by replacing temporary comments
 * with HTML.
 *
 * @param {string} html
 * @returns {string}
 */
function renderStage2(html) {
  let mathReplaceMatch;

  // Temporary work around for docsify issue:
  // https://github.com/docsifyjs/docsify/issues/1881
  while ((mathReplaceMatch = regex.commentReplaceDollarMarkup.exec(html)) !== null) {
    const mathComment = mathReplaceMatch[0];
    const mathReplacement = '$';
    html = html.replace(mathComment, () => mathReplacement);
  }

  while ((mathReplaceMatch = regex.commentReplaceMarkup.exec(html)) !== null) {
    const mathComment = mathReplaceMatch[0];
    const mathReplacement = mathReplaceMatch[1] || '';
    html = html.replace(mathComment, () => (decodeURIComponent(window.atob(mathReplacement))));
  }
  return html;
}

// Plugin
// =============================================================================
function initLatex(hook, vm) {
  hook.beforeEach(async function (content, next) {
    content = await renderStage1(content);
    next(content);
  });

  hook.afterEach(async function (html, next) {
    html = renderStage2(html);
    next(html);
  });
}

if (window) {
  // Init plugin
  window.$docsify.plugins = [].concat(
    (window.$docsify.plugins || []),
    initLatex
  );
}
