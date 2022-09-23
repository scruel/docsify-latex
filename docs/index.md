# docsify-latex

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/scruel/docsify-latex/blob/master/LICENSE)
[![NPM](https://img.shields.io/npm/v/docsify-latex.svg?style=flat-square)](https://www.npmjs.com/package/docsify-latex)
[![GitHub Workflow Status (master)](https://img.shields.io/github/workflow/status/scruel/docsify-latex/Build/master?label=checks&style=flat-square)](https://github.com/scruel/docsify-latex/actions?query=branch%3Amaster+)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/docsify-latex/badge)](https://www.jsdelivr.com/package/npm/docsify-latex)

A [docsify.js](https://docsify.js.org) plugin for typesetting $\LaTeX$ with display engines from markdown.

<br/>
@@
\text{Docsify} + \LaTeX = \heartsuit
@@

## Features

This plugin helps you typeset $\LaTeX$ with some JavaScript $\LaTeX$ display engines.

List of integrated engines:

- [MathJax V3](https://docs.mathjax.org/)
- [MathJax V2](https://docs.mathjax.org/en/v2.7-latest/index.html)
- [KaTeX](https://katex.org/docs)

If you want to integrate more, feel free to fire an issue to explain the reason, or more well, you can directly make a pull request.

Supported engine features:

- Equation cross-reference jump (same page only)
- Handling complex $\LaTeX$

## Installation

Add JavaScript $\LaTeX$ display engine, and docsify-latex plugin after docsify and engine scirpts all to your `index.html`.

Template as following:

```html
<!-- Docsify Here -->

<!-- LaTeX display engine Here -->

<script src="//cdn.jsdelivr.net/npm/docsify-latex@latest/dist/docsify-latex.js"></script>
```

> Notice:
>
> You should put docsify-latex plugin script below docsify and $\LaTeX$ display engine scripts, because plugin script depends on them.
>
> To keep loading scripts in order, you also should remove `async` attribute from the related script elements.

Review the [Options](#Options) section and configure as needed.

For sample usage, you can just use the default options:

```javascript
window.$docsify = {
  // ...
  latex: {
    inlineMath   : [['$', '$'], ['\\(', '\\)']], // default
    displayMath  : [['$$', '$$']],               // default
  }
};
```

### With MathJax

```html
<!-- Docsify Here -->

<script src="//cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<script src="//cdn.jsdelivr.net/npm/docsify-latex@latest/dist/docsify-latex.js"></script>
```

Or if you prefer MathJax version 2:

```html
<!-- Docsify Here -->

<script src="https://cdn.jsdelivr.net/npm/mathjax@2/MathJax.js?config=TeX-AMS_CHTML"></script>

<script src="//cdn.jsdelivr.net/npm/docsify-latex@latest/dist/docsify-latex.js"></script>
```

### With KaTeX

```html
<!-- Docsify Here -->

<script src="https://cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.js"></script>
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.css" />

<script src="//cdn.jsdelivr.net/npm/docsify-latex@latest/dist/docsify-latex.js"></script>
```

> Notice:
>
> You can also add some [KaTeX plugins](https://github.com/KaTeX/KaTeX/tree/main/contrib) after loaded KaTeX script, if you needed.

## Usage

Put $\LaTeX$ within symbols you configured.

For example, by default we configured `$$` for marking section inner $\LaTeX$ in display mode, then:

```latex
$$
E=mc^2
$$
```

> Go to display engine official website for more details about supported $\LaTeX$ functions, you can click links in [Features](#Features) section to visit specific engines documentation website.

### Demos

[Notes-ML-AndrewNg](https://scruel.github.io/Notes-ML-AndrewNg)

## Options

Options are set within the `window.$docsify` configuration under the `latex` key:

```javascript
window.$docsify = {
  // ...
  latex: {
    inlineMath   : [['$', '$'], ['\\(', '\\)']], // default
    displayMath  : [['$$', '$$']],               // default
    customOptions: {}                            // default
  }
};
```

### inlineMath

- Type: `Array[Aarry]`
- Default: `[['$', '$'], ['\\(', '\\)']]`

Text within `inlineMath` symbols you configured will be rendered in inline mode, $\LaTeX$ write for inline mode **must not** cross multiple lines.

For example you can even write:

```javascript
window.$docsify = {
  latex: {
    inlineMath   : [['@', '@']],
  }
};
```

Then you can write:

```latex
@ E=mc^2 @
```

Will be rendered as: @ E=mc^2 @

### displayMath

- Type: `Array[Aarry]`
- Default: `[['$$', '$$']]`

Text within `displayMath` symbols you configured will be rendered in display mode.

> For differences between the two modes, you should check the documentation of $\LaTeX$ engines.

For example you can even write:

```javascript
window.$docsify = {
  // ...
  latex: {
    displayMath  : [['@@', '@@']],
  }
};
```

Then you can write:

```latex
@@
E=mc^2
@@
```

Will be rendered as:

@@
E=mc^2
@@

### customOptions

- Type: `Object`
- Default: `{}`

Let you have a change to configure $\LaTeX$ engine options, so that engine can act by your customized options.

> Notice:
>
> Override `inlineMath` and `displayMath` related options will not take any effects, it's just to prevent having inconsistent behaviors while typesetting $\LaTeX$.

#### MathJax

Review [MathJax documentation Options](https://docs.mathjax.org/en/latest/options/index.html) page for more details.

For example, if you want to issue an alert when page ready for MathJax:

```javascript
window.$docsify = {
  // ...
  latex: {
    // ...
    customOptions: {
      startup: {
        pageReady: () => {
          alert('Running MathJax');
          return MathJax.startup.defaultPageReady();
        }
      },
    }
  }
};
```

Or if you prefer the official configuration way, you can also keep using:

```javascript
window.MathJax = {
  startup: {
    pageReady: () => {
      alert('Running MathJax');
      return MathJax.startup.defaultPageReady();
    }
  },
};
```

> Be aware, the options you put here, might will be overrided by the options you put in `customOptions` section, and you should use this before MathJax loaded (as official documentation mentioned), otherwise plugin will obtain the object contains your options rather than MathJax instance.
>
> For MathJax version 2, I will levea it blank, I think this example should be enough, you can search doc pages by yourself.

#### KaTeX

Review [KaTeX documentation API Options](https://katex.org/docs/options.html) page for more details.

For example, if you prefer color blue as your error color:

```javascript
window.$docsify = {
  // ...
  latex: {
    // ...
    customOptions: {
      errorColor: "#0000ff",
    }
  }
};
```

## License

This project is licensed under the MIT License.

See the [LICENSE](https://github.com/scruel/docsify-latex/blob/master/LICENSE) for details.

Copyright (c) Scruel Tao ([@scruel](https://github.com/scruel))

[MathJax]: https://docs.mathjax.org
[Documentation]: https://scruel.github.io/docsify-latex
