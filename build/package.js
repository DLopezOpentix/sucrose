export var name = "sucrose";
export var version = "0.5.6";
export var description = "Interactive Charts for Business Applications";
export var keywords = ["charts","d3","visualization","svg","mobile","canvas"];
export var homepage = "http://sucrose.io/";
export var license = "Apache-2.0";
export var author = {"name":"Henry Rogers","url":"https://github.com/hhrogersii"};
export var main = "build/sucrose.node.js";
export var browser = "build/sucrose.js";
export var module = "index";
export var stylelint = {"extends":"stylelint-config-standard"};
export var browserslist = ["> 5%"];
export var repository = {"type":"git","url":"https://github.com/sugarcrm/sucrose.git"};
export var scripts = {"package":"json2module package.json > build/package.js","test":"tape 'test/**/*-test.js'","lintcss":"stylelint \"src/less/**/*.less\" --syntax less","postinstall":"make install-post"};
export var dependencies = {"d3":"^4.8.0","d3fc-rebind":"^4.0.1","topojson":"^1.6.26"};
export var devDependencies = {"clean-css":"^3.4.8","jshint":"^2.9.4","json2module":"0.0.3","less":"^2.6.0","less-plugin-autoprefix":"^1.5.1","less-plugin-clean-css":"^1.5.1","make-help":"^1.0.1","package-preamble":"0.0.2","postcss":"^5.2.17","rollup":"^0.36.3","rollup-plugin-ascii":"0.0.3","rollup-plugin-cleanup":"^1.0.0","rollup-plugin-eslint":"^3.0.0","rollup-plugin-node-resolve":"^2.0.0","rollup-plugin-replace":"^1.1.1","stylelint":"^7.10.1","stylelint-config-standard":"^16.0.0","tape":"^4.6.2","uglify-js":"2.6.1"};
