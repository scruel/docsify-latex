# Example

## Complex Content

```latex
Price (\$) for house ($y$)
```

Price (\$) for house ($y$)

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

## Cross-reference jump

> For MathJax, [Automatic Equation Numbering](https://docs.mathjax.org/en/latest/input/tex/eqnumbers.html) need to be manually turn on.
>
> For KaTeX, cross-reference is a workaround come from KaTeX#2003, not supported officially.
>
> Usage:
>
> Reference before and after equation defined use `\ref` or `eqref`:
>
> Use automatic equation numbering or use `\tag` and `\label` to define the equation.
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
