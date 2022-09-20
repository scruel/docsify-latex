// Dependencies
// =============================================================================
import { version as pkgVersion } from '../../package.json';

// Base Tool Functions
// =============================================================================
function unescapeRegexEscape(regexStr) {
  return regexStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getcommentReplaceMarkedText(text) {
  return `<!-- ${commentReplaceMark} ${text} -->`;
}

// Deep cover an object, for every keys in sourceObj, replce the value of targetObj
// if its key exists, or put key&value into targetObj if not exists.
function coverObject(sourceObj, targetObj) {
  Object.keys(sourceObj).forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(targetObj, key)) {
      targetObj[key] = sourceObj[key];
      return;
    }
    if (Object.prototype.toString.call(sourceObj[key]) !== '[object Object]') {
      targetObj[key] = sourceObj[key];
      return;
    }
    coverObject(sourceObj[key], targetObj[key]);
  });
}

// Constants and variables
// =============================================================================
const settings = {
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$']],
  customOptions: {}
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

// Math Render Init
// =============================================================================
const commentReplaceMark = 'latex:replace';
const deleteReplaceMark = 'latex:delete';
const commentReplaceDollarMark = getcommentReplaceMarkedText('ESCAPEDOLLAR');

const latexContainerTagName = 'docsify-latex';

let hasMathJax = (typeof MathJax !== 'undefined' && MathJax);
const hasKatex = (typeof katex !== 'undefined' && katex);

if (hasMathJax) {
  // MathJax configs and functions init
  MathJax.renderToString = (content) => {
    return `<${latexContainerTagName}>${content}</${latexContainerTagName}>`;
  };
  if (MathJax.version[0] === '3') {
    coverObject(settings.customOptions, MathJax.config);
    // Prevent inconsistency render symbol problem
    MathJax.config.tex.inlineMath = settings.inlineMath;
    MathJax.config.tex.displayMath = settings.displayMath;
    MathJax.startup.getComponents();

    MathJax.renderElement = (mathbox) => {
      MathJax.typesetPromise([mathbox]);
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

    MathJax.renderElement = (mathbox) => {
      MathJax.Hub.Queue(
        ['Typeset', MathJax.Hub, mathbox],
      );
    };
  }
  else {
    hasMathJax = false;
  }
}
else if (hasKatex) {
  // pass
}


const regex = {
  escapeDollarMarkup: /(\\\$)/g,

  // Matches html code blocks (inline and multi-line)
  // Example: <code>CODE</code>
  codeTagMarkup: new RegExp('(?<=[^\\\\]|^)(<code>[\\s\\S]*?(?<=[^\\\\])</code>)', 'm'),

  // Matches markdown code blocks (inline and multi-line)
  // Example: ```CODE```
  codeBlockMarkup: new RegExp('(?<=[^\\\\]|^)(```[\\s\\S]*?(?<=[^\\\\])```)', 'm'),

  // Matches markdown inline code
  // Example: `CODE`
  codeInlineMarkup: new RegExp('(?<=[^\\\\]|^)(`.*?(?<=[^\\\\])`)'),

  commentDeleteReplaceMarkup: /^(>?[ ]*)<!--/gm,

  // Matches replacement comment
  // 0: Match
  // 1: Replacement HTML
  commentReplaceMarkup: new RegExp(`<!-- ${commentReplaceMark} (.*?) -->`),
  commentReplaceDollarMarkup: new RegExp(commentReplaceDollarMark),
};

// Math Render functions
// =============================================================================
function renderMathContent(content, latex, isInline) {
  if (hasMathJax) {
    return MathJax.renderToString(content);
  } else if (hasKatex) {
    const options = {
      throwOnError: false
    };
    coverObject(settings.customOptions, options);
    options.displayMode = !isInline;

    return katex.renderToString(latex, options);
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
    return new RegExp(`(?<=[^\\\\]|^)${matchStartRegex}(.*?(?<=[^\\\\]))${matchEndRegex}`);
  }
  // Matches markdown math blocks
  return new RegExp(`(?<=[^\\\\]|^)${matchStartRegex}([\\s\\S]*?(?<=[^\\\\]))${matchEndRegex}`, 'm');
}

function matchMathBlockRegex(content, regexGroup, isInline){
  const mathRegex = getRegexMarkup(regexGroup[0], regexGroup[1], isInline);
  const result = content.match(mathRegex);
  if (result) {
    result.inline = isInline;
    result.regex = mathRegex;
    return result;
  }
  return null;
}

function matchMathBlock(content) {
  for (const regexGroup of settings.displayMath) {
    const result = matchMathBlockRegex(content, regexGroup, false);
    if (result) {
      return result;
    }
  }
  for (const regexGroup of settings.inlineMath) {
    const result = matchMathBlockRegex(content, regexGroup, true);
    if (result) {
      return result;
    }
  }
  return null;
}
function codeMatchReplacedConent(content, contentMatch, replaceMark, codeMatchList, codeMarkerList) {
  const matchLength = contentMatch[0].length;
  const codeBlock = content.substring(contentMatch.index, contentMatch.index + matchLength);
  const idx = codeMatchList.push(codeBlock);
  const codeMarker = getcommentReplaceMarkedText(`${replaceMark}${idx}`);
  codeMarkerList.push(codeMarker);
  content = content.substring(0, contentMatch.index) + codeMarker
    + content.substring(contentMatch.index + matchLength, content.length);
  return content;
}
/**
 * Converts LaTeX content into "stage 1" markup. Stage 1 markup contains temporary
 * comments which are replaced with HTML during Stage 2. This approach allows
 * all markdown to be converted to HTML before LaTeX-specific HTML is added.
 *
 * @param {string} content
 * @returns {string}
 */
function renderStage1(content) {
  // Protect content:
  // Replace escaped char with marker to prevent wrong regex match.
  // Replace code block with marker to ensure LaTeX markup within code
  // blocks is not processed.
  // These markers are replaced with their associated code blocs after
  // blocks have been processed.
  // WARN: Do not change the order of matches!
  let contentMatch;
  const escapeMatch = content.match(regex.escapeDollarMarkup) || [];
  escapeMatch.forEach((item) => {
    content = content.replace(item, () => commentReplaceDollarMark);
  });
  const codeMatchList = [];
  const codeMarkerList = [];
  while ((contentMatch = content.match(regex.codeTagMarkup)) !== null) {
    content = codeMatchReplacedConent(content, contentMatch, 'CODETAG', codeMatchList, codeMarkerList);
  }
  while ((contentMatch = content.match(regex.codeBlockMarkup)) !== null) {
    content = codeMatchReplacedConent(content, contentMatch, 'CODEBLOCK', codeMatchList, codeMarkerList);
  }
  while ((contentMatch = content.match(regex.codeInlineMarkup)) !== null) {
    content = codeMatchReplacedConent(content, contentMatch, 'CODEINLINE', codeMatchList, codeMarkerList);
  }

  // Render math blocks
  while ((contentMatch = matchMathBlock(content)) !== null) {
    const matchLength = contentMatch[0].length;
    const mathBlockOut = renderMathContent(contentMatch[0], contentMatch[1], contentMatch.inline);
    const mathBlockOutReplacement = getcommentReplaceMarkedText(window.btoa(encodeURIComponent(mathBlockOut)));
    content = content.substring(0, contentMatch.index) + mathBlockOutReplacement
      + content.substring(contentMatch.index + matchLength, content.length);
  }

  // Unprotect content - restore code blocks
  codeMarkerList.forEach((item, i) => {
    content = content.replace(item, () => codeMatchList[i]);
  });
  // Ensure docsify can render line breaks by itself, rather than ignore empty lines.
  content = content.replaceAll(regex.commentDeleteReplaceMarkup, `$1${deleteReplaceMark}<!--`);
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
  html = html.replaceAll(deleteReplaceMark, '');

  // Temporary work around for docsify issue:
  // https://github.com/docsifyjs/docsify/issues/1881
  while ((mathReplaceMatch = regex.commentReplaceDollarMarkup.exec(html)) !== null) {
    const mathComment = mathReplaceMatch[0];
    const mathReplacement = '$';
    html = html.replace(mathComment, () => mathReplacement);
  }

  // Restore all commented elements
  while ((mathReplaceMatch = regex.commentReplaceMarkup.exec(html)) !== null) {
    const mathComment = mathReplaceMatch[0];
    const mathReplacement = mathReplaceMatch[1] || '';
    html = html.replace(mathComment, () => (decodeURIComponent(window.atob(mathReplacement))));
  }
  return html;
}

function renderStage3() {
  // Perform remain actions to latex elements
  if (hasMathJax) {
    const mathElements =  document.getElementsByTagName(latexContainerTagName);
    for (const mathbox of mathElements) {
      MathJax.renderElement(mathbox);
    }
  }
}

// Plugin
// =============================================================================
function initLatex(hook, vm) {
  hook.beforeEach(function (content, next) {
    content = renderStage1(content);
    next(content);
  });

  hook.afterEach(function (html, next) {
    html = renderStage2(html);
    next(html);
  });
  hook.doneEach(function() {
    renderStage3();
  });

}

if (window) {
  // Init plugin
  window.$docsify.plugins = [].concat(
    (window.$docsify.plugins || []),
    initLatex
  );
}
