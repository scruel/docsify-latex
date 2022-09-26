# docsify-latex

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/scruel/docsify-latex/blob/master/LICENSE)
[![GitHub Workflow Status (master)](https://img.shields.io/github/workflow/status/scruel/docsify-latex/Build/master?label=checks&style=flat-square)](https://github.com/scruel/docsify-latex/actions?query=branch%3Amaster+)
[![NPM](https://img.shields.io/npm/v/docsify-latex.svg?style=flat-square)](https://www.npmjs.com/package/docsify-latex)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/docsify-latex/badge)](https://www.jsdelivr.com/package/npm/docsify-latex)

A [docsify.js](https://docsify.js.org) plugin for typesetting LaTeX with display engines from markdown.

<br/>
<p align="center">Docsify + LaTeX = :heart:</p>

## Installation

Add JavaScript LaTeX display engine, and docsify-latex plugin after docsify and engine scirpts all to your `index.html`.

For example, I prefer [MathJax][MathJax], and load scripts from the content delivery network (CDN):

```html
<!-- Docsify v4 -->
<script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
<!-- LaTeX display engine -->
<script src="//cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<!--  docsify-latex plugin -->
<script src="//cdn.jsdelivr.net/npm/docsify-latex@0"></script>
```

Configure latex plugin options:

```javascript
window.$docsify = {
  // ...
  latex: {
    inlineMath   : [['$', '$'], ['\\(', '\\)']], // default
    displayMath  : [['$$', '$$']],               // default
  }
};
```

> Notice:
>
> You should put docsify-latex plugin script below docsify and LaTeX display engine scripts, because plugin script **depends on** them.
>
> To keep loading scripts in order, you also should remove `async` attribute from the script element.

See [Documentation site][Documentation] for more usage and more details.

## Usage

Put LaTeX within symbols you configured.

For example, by default we configured `$$` for marking section inner LaTeX in display mode, then:

```math
$$
E=mc^2
$$
```

Go to display engine official website for more details about supported LaTeX functions.

See [Documentation site][Documentation] for more usage and more details.

Seeking for demo projects, click [here][Demo Projects] to learn more.

## Features

This plugin helps you typeset LaTeX with some JavaScript LaTeX display engines.

**Supported engine features**:

- Equation cross-reference jump (same page only)
- Typsetting complex LaTeX content
- Overflowed content scroll bar

See [Documentation Example][Documentation Example] for more details.

**List of integrated engines**:

- [MathJax V3](https://docs.mathjax.org/)
- [MathJax V2](https://docs.mathjax.org/en/v2.7-latest/index.html)
- [KaTeX](https://katex.org/docs)

> If you want to integrate more engines, feel free to fire an issue to explain the reason, or more well, you can directly make a pull request.

## License

This project is licensed under the MIT License.

See the [LICENSE](https://github.com/scruel/docsify-latex/blob/master/LICENSE) for details.

Copyright (c) Scruel Tao ([@scruel](https://github.com/scruel))

[MathJax]: https://docs.mathjax.org
[Documentation]: https://scruel.github.io/docsify-latex
[Documentation Example]: https://scruel.github.io/docsify-latex/#/example
[Demo Projects]: https://scruel.github.io/docsify-latex/#/demo
