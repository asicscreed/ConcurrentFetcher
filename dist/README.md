## Choose the right file:
The distribution folder (dist) contains 6 javascript formats. Choose the 1 that suits your needs :-)
<br><i>amd</i> – Asynchronous Module Definition, used with module loaders like RequireJS
<br><i>cjs</i> – CommonJS, suitable for Node and other bundlers (alias: commonjs)
<br><i>es</i> – Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers (alias: esm, module)
<br><i>iife</i> – A self-executing function, suitable for inclusion as a <script> tag. (If you want to create a bundle for your application, you probably want to use this.). "iife" stands for "immediately-invoked Function Expression"
<br><i>umd</i> – Universal Module Definition, works as amd, cjs and iife all in one
<br><i>system</i> – Native format of the SystemJS loader (alias: systemjs)
<br>For using or testing <i>in a browser</i> include the concurrentfetcher.iife.js file within a script tag. 
