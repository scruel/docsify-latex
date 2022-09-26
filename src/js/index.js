// Dependencies
// =============================================================================
import settings from './settings';
import latexRender from './render';
import { escapeHtml, escapeRegex } from './tools';
import { latexTagName, latexTagDisplayAttrName } from './constant';

// Constants and variables
// =============================================================================
const commentReplaceMark = 'latex:replace';
const deleteReplaceMark = 'latex:delete';

// Regex rules Init
// =============================================================================
function getCommentReplaceMarkedText(text, placeholder='') {
  return `<!-- ${commentReplaceMark} ${placeholder} ${text} -->`;
}

// Matches replacement comment
function getCommentReplaceMarkupRegex(placeholder='') {
  return new RegExp(`<!-- ${commentReplaceMark} ${placeholder} (.*?) -->`);
}

function getBlockRegex(matchStartRegex, matchEndRegex, needMatchMultipleLine, escape = true) {
  // Escape string according to regex syntax
  if (escape) {
    matchStartRegex = escapeRegex(matchStartRegex);
    matchEndRegex = escapeRegex(matchEndRegex);
  }
  // Matches markdown inline math
  // Group 0: whole match result
  // Group 1: content (with matchRegexs)
  // Group 2: matchStartRegex match result
  // Group 3: inner content (with matchRegexs)
  return new RegExp(`(?:^|[^\\\\])((${matchStartRegex})((?:[^\\\\${needMatchMultipleLine ? '' : '\n'}]|\\\\.)+?)${matchEndRegex})`);
}

function matchByRegexArray(content, regexGroup, displayMode = false) {
  const mathRegex = getBlockRegex(regexGroup[0], regexGroup[1], displayMode);
  return matchByRegex(content, mathRegex, displayMode);
}

function matchByRegex(content, regex, displayMode = false) {
  const matchResult = content.match(regex);
  if (matchResult) {
    const result = {};
    result.displayMode = displayMode;
    result.content = matchResult[1];
    result.innerContent = matchResult[3];
    result.index = matchResult.index + matchResult[0].length - result.content.length;
    result.endIndex = result.index + result.content.length;
    // For debug only
    result.regex = regex;
    return result;
  }
  return null;
}

const codePlaceholder = 'CODE';

const regex = {
  // Matches html code blocks (inline and multi-line)
  // Example: <code>CODE</code>
  codeTagMarkup: getBlockRegex('<code>', '</code>', true),

  // Matches markdown code blocks (inline and multi-line)
  // Example: ```CODE```
  codeBlockMarkup: getBlockRegex('`{3,}', '\\2', true, false),

  // Matches markdown inline code
  // Example: `CODE`
  codeInlineMarkup: getBlockRegex('`{1,}', '\\2', false, false),

  commentDeleteReplaceMarkup: /^(>?[ ]*)<!--/gm,

  commentReplaceMarkup: getCommentReplaceMarkupRegex(),
  commentCodeReplaceMarkup: getCommentReplaceMarkupRegex(codePlaceholder)
};

// Match functions
// =============================================================================

function matchMathBlocks(content) {
  let inlineResult;
  let displayResult;
  const resultList = [];
  for (const regexGroup of settings.inlineMath) {
    inlineResult = matchByRegexArray(content, regexGroup, false);
    if (inlineResult) {
      break;
    }
  }
  for (const regexGroup of settings.displayMath) {
    displayResult = matchByRegexArray(content, regexGroup, true);
    if (displayResult) {
      break;
    }
  }
  if (inlineResult) {
    if (null === displayResult) {
      resultList.push(inlineResult);
    }
    // If display shows before inline section, keep display only, no
    // matter two blocks have any intersection.
    else if (displayResult.index > inlineResult.index) {
      resultList.push(inlineResult);
      // Display and inline have intersection, keep inline only.
      if (displayResult.index < inlineResult.endIndex) {
        displayResult = null;
      }
      // No intersection, two independent matches.
    }
  }
  if (displayResult) {
    resultList.push(displayResult);
  }
  return resultList;
}

/**
 * Used to replace the content with matched result and wrapper it to comment
 * to prevent unpredictable behaviour
 *
 * @param {*} content original content
 * @param {*} contentMatch regex match result
 * @param {*} matchIndexForReplace which index of match result will be used to replace the original content
 * @param {*} placeholder place holder for replaced content
 * @param {*} matchList
 * @param {*} markerList
 * @returns
 */
function matchReplacedConent(content, contentMatch, placeholder='') {
  const contentLength = contentMatch.content.length;
  const commentedConent = getCommentReplaceMarkedText(window.btoa(encodeURIComponent(contentMatch.content)), `${placeholder}`);
  content = content.substring(0, contentMatch.index) + commentedConent
    + content.substring(contentMatch.index + contentLength, content.length);
  return content;
}

function getCodeRestoredContent(content) {
  let contentMatch;
  while ((contentMatch = regex.commentCodeReplaceMarkup.exec(content)) !== null) {
    const commentMark = contentMatch[0];
    const originalContent = contentMatch[1] || '';
    content = content.replace(commentMark, () => (decodeURIComponent(window.atob(originalContent))));
  }
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
  let contentMatch;
  // Protect content
  // Replace code block with marker to ensure LaTeX markup within code
  // blocks is not processed.
  // These markers are replaced with their associated code blocs after
  // blocks have been processed.
  // WARN: Do not change the order of matches!
  while ((contentMatch = matchByRegex(content, regex.codeTagMarkup)) !== null) {
    content = matchReplacedConent(content, contentMatch, codePlaceholder);
  }
  while ((contentMatch = matchByRegex(content, regex.codeBlockMarkup)) !== null) {
    content = matchReplacedConent(content, contentMatch, codePlaceholder);
  }
  while ((contentMatch = matchByRegex(content, regex.codeInlineMarkup)) !== null) {
    content = matchReplacedConent(content, contentMatch, codePlaceholder);
  }

  // Render math blocks without code symbol `
  let mathMatchs;
  while ((mathMatchs = matchMathBlocks(content)).length !== 0) {
    let lastIndex = -1;
    let lastOffset = 0;
    for (contentMatch of mathMatchs) {
      const matchLength = contentMatch.content.length;
      let preparedContent = latexRender.prepareContent(contentMatch.content, contentMatch.innerContent);
      preparedContent = getCodeRestoredContent(preparedContent);
      const latexElementAttrList = [];
      latexElementAttrList.push(`${latexTagDisplayAttrName}="${contentMatch.displayMode}"`);
      if (settings.overflowScroll) {
        const displayStyle = contentMatch.displayMode ? 'block' : 'inline-flex';
        latexElementAttrList.push(`style="max-width: 100%;display: ${displayStyle};overflow: auto hidden;"`);
      }
      const preparedHTML = `<${latexTagName} ${latexElementAttrList.join(' ')}>${escapeHtml(preparedContent)}</${latexTagName}>`;
      const contentReplacement = getCommentReplaceMarkedText(window.btoa(encodeURIComponent(preparedHTML)));
      let contentIndex = contentMatch.index;
      if (contentMatch.index > lastIndex) {
        contentIndex += lastOffset;
      }
      lastIndex = contentMatch.index;
      lastOffset = contentReplacement.length - matchLength;
      content = content.substring(0, contentIndex) + contentReplacement
        + content.substring(contentIndex + matchLength, content.length);
    }
  }

  // Unprotect content
  content = getCodeRestoredContent(content);

  // Put this in end of the processing pipeline, ensure docsify can render line breaks
  // by itself, rather than ignore empty lines.
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
  let contentMatch;
  html = html.replaceAll(deleteReplaceMark, '');

  // Restore all commented elements
  while ((contentMatch = regex.commentReplaceMarkup.exec(html)) !== null) {
    const commentMark = contentMatch[0];
    const originalContent = contentMatch[1] || '';
    html = html.replace(commentMark, () => (decodeURIComponent(window.atob(originalContent))));
  }
  return html;
}

async function renderStage3() {
  latexRender.prepareRender();
  // Perform remain actions to latex elements
  const mathElements =  document.getElementsByTagName(latexTagName);
  for (const element of mathElements) {
    const displayMode = element.getAttribute(latexTagDisplayAttrName) === 'true';
    await latexRender.renderElement(element, displayMode);
  }
  latexRender.afterRender();
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
  hook.doneEach(async function() {
    await renderStage3();
  });

}

if (window) {
  // Init plugin
  window.$docsify.plugins = [].concat(
    (window.$docsify.plugins || []),
    initLatex
  );
}
