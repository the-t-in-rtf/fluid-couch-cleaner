/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.setLogging(true);

require("./js/lib/harness");

fluid.tests.couchCleaner.harness({
    port: "8459"
});
