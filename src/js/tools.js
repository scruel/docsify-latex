export function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function unescapeHtml(htmlStr) {
  htmlStr = htmlStr.replace(/&lt;/g , '<');
  htmlStr = htmlStr.replace(/&gt;/g , '>');
  htmlStr = htmlStr.replace(/&quot;/g , '"');
  htmlStr = htmlStr.replace(/&#39;/g , '\'');
  htmlStr = htmlStr.replace(/&amp;/g , '&');
  return htmlStr;
}

export function escapeRegex(regexStr) {
  return regexStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Deep cover an object, for every keys in sourceObj, replce the value of targetObj
// if its key exists, or put key&value into targetObj if not exists.
export function coverObject(sourceObj, targetObj) {
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
