// Render related functions
// =============================================================================
import { latexTagName, latexBackTagName } from './constant';

// TODO: custom
const jumpToTitle = 'Jump to equation';
const gobackTitle = 'Back To Reference';
const linkColor = '#0B87DA';

// Implementation
// =============================================================================
export function addReferenceJump(element) {
  const elements = element.querySelectorAll(`${latexTagName} a[href]`);
  if (elements === null || elements.length === 0) {
    return;
  }
  for (const linkElement of elements) {
    if (!Object.prototype.hasOwnProperty.call(linkElement.style, 'color')
       || !linkElement.style.color) {
      linkElement.style.color = linkColor;
    }
    // Add jump
    const hrefAttr = linkElement.getAttribute('href');
    const refId = decodeURIComponent(hrefAttr).substring(1);
    if (hrefAttr.startsWith('#')) {
      linkElement.title = jumpToTitle;
      linkElement.onclick = () => {
        const referedEle = document.getElementById(refId);
        if (null === referedEle) {
          return true;
        }

        let referedLatexEle = referedEle.parentElement;
        while (referedLatexEle !== null) {
          if (referedLatexEle.tagName === latexTagName.toUpperCase()) {
            break;
          }
          referedLatexEle = referedLatexEle.parentElement;
        }
        // Add back to reference element
        let backToEle = referedLatexEle.querySelector(latexBackTagName);
        if (null === backToEle) {
          backToEle = document.createElement(latexBackTagName);
          referedLatexEle.append(backToEle);
          backToEle.innerHTML = `<a href onclick="return false;">${gobackTitle}</a>`;
          backToEle.style.color = linkColor;
          backToEle.style.float = 'right';
        }
        const currentPosition = document.documentElement.scrollTop;
        backToEle.style.display = '';
        backToEle.onclick = () => {
          backToEle.style.display = 'none';
          window.scrollTo(0, currentPosition);
          return false;
        };

        window.scrollTo(0, referedLatexEle.offsetTop - linkElement.getBoundingClientRect().top);
        return false;
      };
    }
  }
}
