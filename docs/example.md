# Feature Example

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/scruel/docsify-latex/blob/master/LICENSE)
[![NPM](https://img.shields.io/npm/v/docsify-latex.svg?style=flat-square)](https://www.npmjs.com/package/docsify-latex)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/docsify-latex/badge)](https://www.jsdelivr.com/package/npm/docsify-latex)

<blockquote>
Plugin vesrion: <span id="docsify-latex-version"></span> (on current page)

This page might contains some new features, so make sure you can see docsify-latex latest version above, otherwise please try to clear your cache then refresh the page.
</blockquote>

## Complex Content

```latex
Price (\$) for house ($y$)
```

Price (\$) for house ($y$)

----

Long equation:

```latex
Inline mode: $J(\theta )= \frac{1}{2m}\left( {{\theta }^{T}}{{X}^{T}}X\theta -{{\theta}^{T}}{{X}^{T}}y-{{y}^{T}}X\theta + {{y}^{T}}y \right) $ equation.

Inline mode: $J(\theta) = - \frac{1}{m} \sum_{i=1}^m [ y^{(i)}\ \log (h_\theta (x^{(i)})) + (1 - y^{(i)})\ \log (1 - h_\theta(x^{(i)}))] + \frac{\lambda}{2m}\sum_{j=1}^n \theta_j^2$ equation 2.

Display mode:
$$
J(\theta) = - \frac{1}{m} \sum_{i=1}^m [ y^{(i)}\ \log (h_\theta (x^{(i)})) + (1 - y^{(i)})\ \log (1 - h_\theta(x^{(i)}))] + \frac{\lambda}{2m}\sum_{j=1}^n \theta_j^2
$$


Display mode with tag:
$$
J(\theta) = - \frac{1}{m} \sum_{i=1}^m [ y^{(i)}\ \log (h_\theta (x^{(i)})) + (1 - y^{(i)})\ \log (1 - h_\theta(x^{(i)}))] + \frac{\lambda}{2m}\sum_{j=1}^n \theta_j^2\tag{DIS}\label{eq:dis}
$$
```

In inline mode: $J(\theta )= \frac{1}{2m}\left( {{\theta }^{T}}{{X}^{T}}X\theta -{{\theta}^{T}}{{X}^{T}}y-{{y}^{T}}X\theta + {{y}^{T}}y \right) $ equation.

Inline mode: $J(\theta) = - \frac{1}{m} \sum_{i=1}^m [ y^{(i)}\ \log (h_\theta (x^{(i)})) + (1 - y^{(i)})\ \log (1 - h_\theta(x^{(i)}))] + \frac{\lambda}{2m}\sum_{j=1}^n \theta_j^2$ equation 2.

Display mode:
$$
J(\theta) = - \frac{1}{m} \sum_{i=1}^m [ y^{(i)}\ \log (h_\theta (x^{(i)})) + (1 - y^{(i)})\ \log (1 - h_\theta(x^{(i)}))] + \frac{\lambda}{2m}\sum_{j=1}^n \theta_j^2
$$

Display mode with tag:
$$
J(\theta) = - \frac{1}{m} \sum_{i=1}^m [ y^{(i)}\ \log (h_\theta (x^{(i)})) + (1 - y^{(i)})\ \log (1 - h_\theta(x^{(i)}))] + \frac{\lambda}{2m}\sum_{j=1}^n \theta_j^2\tag{DIS}\label{eq:dis}
$$

----

```latex
$$
\overbrace{a+b+c}^{\text{note}}
$$
```

$$
\overbrace{a+b+c}^{\text{note}}
$$

----

```latex
$$
\sum_{\substack{0<i<m\\0<j<n}}
$$
```

$$
\sum_{\substack{0<i<m\\0<j<n}}
$$

----

`\hbox` put their argument into text mode. To raise math, nest `$…$` delimiters inside the argument as shown below.

```latex
$$
a+\left(\vcenter{\hbox{$\frac{\frac a b}c$}}\right)
$$
```

$$
a+\left(\vcenter{\hbox{$\frac{\frac a b}c$}}\right)
$$

----

Labeled equation:

```latex
$x+y^{2x}\tag*{MEE}\label{mee}$
```

$$E = mc^2\tag*{MEE}\label{mee}$$

----

`\newcommand` function:

```latex
$$
\newcommand{\hdotsfour}{\cdots & \cdots & \cdots & \cdots}
\begin{pmatrix}
 1     &  \frac{1}{2}  &\dots  &\frac{1}{n} \\
 \hdotsfour\\
 m     &  \frac{m}{2} &\dots  &\frac{m}{n}
 \end{pmatrix}
$$
```

$$
\newcommand{\hdotsfour}{\cdots & \cdots & \cdots & \cdots}
\begin{pmatrix}
 1     &  \frac{1}{2}  &\dots  &\frac{1}{n} \\
 \hdotsfour\\
 m     &  \frac{m}{2} &\dots  &\frac{m}{n}
 \end{pmatrix}
$$

----

Colored chemical formula:

```latex
$$
\ce{\color{#0B87DA}{H2O}}
$$
```

$$
\ce{\color{#0B87DA}{H2O}}
$$

----

## Cross-reference jump

> For MathJax, [Automatic Equation Numbering](https://docs.mathjax.org/en/latest/input/tex/eqnumbers.html) need to be manually turn on.
>
> For KaTeX, cross-reference is a workaround come from [KaTeX#2003](https://github.com/KaTeX/KaTeX/issues/2003), it's not officially supported.
>
> Usage:
>
> Use automatic equation numbering functions or use `\tag` and `\label` to define the equation.
>
> Reference before or after defined equation use `\ref` or `eqref`:
>
> For more details, you should check the website of the engine you are using.

I'd like to reference the equation $\eqref{mee}$ from the last chapter, it's a well-known equation all over the world.

When $a \ne 0$, there are two solutions to $ax^2 + bx + c = 0$ and they are $\ref{eq:m1}$

$$
x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\tag{M1}\label{eq:m1}
$$

This equation $\eqref{eq:m1}$ is very important.

In equation $\eqref{eq:sample}$, we find the value of an interesting integral:

$$
\begin{equation}
  \int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15}
  \label{eq:sample}
\end{equation}
$$

<script>
  document.getElementById("docsify-latex-version").innerHTML = window.$docsify.latex.version;
</script>
