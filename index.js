/* eslint-env node */
"use strict";
var fluid = require("infusion");

// Expose this package's content so that relative paths can be resolved using `fluid.module.resolvePath`.
fluid.module.register("fluid-couch-cleaner", __dirname, require);

require("./src/js/couchCleaner");
