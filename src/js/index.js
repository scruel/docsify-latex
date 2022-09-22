// Dependencies
// =============================================================================
import settings from './settings';
import latexRender from './render';
import { escapeHtml, escapeRegex } from './tools';

// Constants and variables
// =============================================================================
const commentReplaceMark = 'latex:replace';
const deleteReplaceMark = 'latex:delete';

const latexTagName = 'docsify-latex';
const latexTagDisplayAttrName = 'display';

// Regex rules Init
// =============================================================================
function getCommentReplaceMarkedText(text, placeholder='') {
  return `<!-- ${commentReplaceMark} ${placeholder} ${text} -->`;
}

// Matches replacement comment
function getCommentReplaceMarkupRegex(placeholder='') {
  return new RegExp(`<!-- ${commentReplaceMark} ${placeholder} (.*?) -->`);
}

function getBlockRegex(matchStartRegex, matchEndRegex, needMatchMultipleLine) {
  // Escape string according to regex syntax
  matchStartRegex = escapeRegex(matchStartRegex);
  matchEndRegex = escapeRegex(matchEndRegex);
  // Matches markdown inline math
  return new RegExp(`(?<=[^\\\\]|^)${matchStartRegex}(([^\\\\${needMatchMultipleLine ? '' : '\n'}]|\\\\.)+?)${matchEndRegex}`);
}

const codePlaceholder = 'CODE';

const regex = {
  // Matches html code blocks (inline and multi-line)
  // Example: <code>CODE</code>
  codeTagMarkup: getBlockRegex('<code>', '</code>', true),

  // Matches markdown code blocks (inline and multi-line)
  // Example: ```CODE```
  codeBlockMarkup: getBlockRegex('```', '```', true),

  // Matches markdown inline code
  // Example: `CODE`
  codeInlineMarkup: getBlockRegex('`', '`', false),

  commentDeleteReplaceMarkup: /^(>?[ ]*)<!--/gm,

  commentReplaceMarkup: getCommentReplaceMarkupRegex(),
  commentCodeReplaceMarkup: getCommentReplaceMarkupRegex(codePlaceholder)
};

// Match functions
// =============================================================================
function matchMathBlockRegex(content, regexGroup, displayMode){
  const mathRegex = getBlockRegex(regexGroup[0], regexGroup[1], displayMode);
  const matchResult = content.match(mathRegex);
  if (matchResult) {
    const result = {};
    result.displayMode = displayMode;
    result.index = matchResult.index;
    result.content = matchResult[0];
    result.latex = matchResult[1];
    // For debug only
    result.regex = mathRegex;
    return result;
  }
  return null;
}

function matchMathBlock(content) {
  for (const regexGroup of settings.inlineMath) {
    const result = matchMathBlockRegex(content, regexGroup, false);
    if (result) {
      return result;
    }
  }
  for (const regexGroup of settings.displayMath) {
    const result = matchMathBlockRegex(content, regexGroup, true);
    if (result) {
      return result;
    }
  }
  return null;
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
function matchReplacedConent(content, contentMatch, matchIndexForReplace, placeholder='') {
  const matchLength = contentMatch[0].length;
  const replaceContent = contentMatch[matchIndexForReplace];
  const commentedConent = getCommentReplaceMarkedText(window.btoa(encodeURIComponent(replaceContent)), `${placeholder}`);
  content = content.substring(0, contentMatch.index) + commentedConent
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
  let contentMatch;
  // Protect content
  // Replace code block with marker to ensure LaTeX markup within code
  // blocks is not processed.
  // These markers are replaced with their associated code blocs after
  // blocks have been processed.
  // WARN: Do not change the order of matches!
  while ((contentMatch = content.match(regex.codeTagMarkup)) !== null) {
    content = matchReplacedConent(content, contentMatch, 0, codePlaceholder);
  }
  while ((contentMatch = content.match(regex.codeBlockMarkup)) !== null) {
    content = matchReplacedConent(content, contentMatch, 0, codePlaceholder);
  }
  while ((contentMatch = content.match(regex.codeInlineMarkup)) !== null) {
    content = matchReplacedConent(content, contentMatch, 0, codePlaceholder);
  }

  // Render math blocks
  while ((contentMatch = matchMathBlock(content)) !== null) {
    const matchLength = contentMatch.content.length;
    const preparedContent = latexRender.prepareContent(contentMatch.content, contentMatch.latex);
    const preparedHTML = `<${latexTagName} ${latexTagDisplayAttrName}='${contentMatch.displayMode}'>${escapeHtml(preparedContent)}</${latexTagName}>`;
    const contentReplacement = getCommentReplaceMarkedText(window.btoa(encodeURIComponent(preparedHTML)));
    content = content.substring(0, contentMatch.index) + contentReplacement
      + content.substring(contentMatch.index + matchLength, content.length);
  }

  // Unprotect content - restore code blocks
  while ((contentMatch = regex.commentCodeReplaceMarkup.exec(content)) !== null) {
    const commentMark = contentMatch[0];
    const originalContent = contentMatch[1] || '';
    content = content.replace(commentMark, () => (decodeURIComponent(window.atob(originalContent))));
  }

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

function renderStage3() {
  latexRender.prepareRender();
  // Perform remain actions to latex elements
  const mathElements =  document.getElementsByTagName(latexTagName);
  for (const element of mathElements) {
    const displayMode = element.getAttribute(latexTagDisplayAttrName) === 'true';
    latexRender.renderElement(element, displayMode);
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
