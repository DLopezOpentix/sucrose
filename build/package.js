export var name = "sucrose";
export var version = "0.7.2";
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
export var scripts = {"instrument":"rimraf ./tests/fixtures/build && nyc instrument ./build/sucrose.js ./test/fixtures/ && cp ./build/d3.min.js ./test/fixtures/build/d3.min.js && cp ./build/sucrose.min.css ./test/fixtures/build/sucrose.min.css","cover-all":"nyc tape ./test/specs/**/*-test.js --cover","cover-unit":"nyc tape ./test/specs/unit/*-test.js","cover-dom":"nyc tape ./test/specs/dom/*-test.js","cover-int":"nyc tape ./test/specs/int/*-test.js --cover","cover-rpt":"nyc report","report-coverage":"nyc report --reporter=lcov > coverage.lcov && codecov","test":"npm run instrument && npm run cover-all","test-all":"tape 'test/specs/**/*-test.js' | faucet","test-unit":"tape test/specs/unit/*-test.js","test-dom":"tape test/specs/dom/*-test.js","test-int":"tape test/specs/int/*-test.js","lintcss":"stylelint \"src/less/**/*.less\" --syntax less","package":"json2module package.json > build/package.js"};
export var nyc = {"include":["**/fixtures/build/sucrose.js"],"reporter":["lcov","clover"],"cache":false,"temp-directory":".coverage"};
export var dependencies = {"d3":"4.9.1","topojson":"^1.6.26"};
export var devDependencies = {"cldr":"^4.5.0","cldr-data":"^31.0.2","cldrjs":"^0.5.0","clean-css":"^3.4.8","codecov":"^2.2.0","extend-tape":"^1.2.0","faucet":"0.0.1","istanbul":"^0.4.5","jsdom":"11.2.0","jshint":"^2.9.4","json2module":"0.0.3","less":"^2.6.0","less-plugin-autoprefix":"^1.5.1","less-plugin-clean-css":"^1.5.1","make-help":"^1.0.1","nightmare":"^2.10.0","nyc":"^11.0.2","package-preamble":"0.0.2","postcss":"^5.2.17","rimraf":"^2.6.1","rollup":"^0.36.3","rollup-plugin-ascii":"0.0.3","rollup-plugin-cleanup":"^1.0.0","rollup-plugin-eslint":"^3.0.0","rollup-plugin-node-resolve":"^2.0.0","rollup-plugin-replace":"^1.1.1","stylelint":"^7.10.1","stylelint-config-standard":"^16.0.0","tape":"^4.6.2","tapes":"^4.1.0","uglify-js":"2.6.1"};
