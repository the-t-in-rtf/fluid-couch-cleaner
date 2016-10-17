// Tests for the "find" functionality
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("../../");
require("./lib");

fluid.defaults("fluid.tests.couchCleaner.find.caseHolder", {
    gradeNames: ["fluid.tests.couchCleaner.caseHolder"],
    testFiles: ["%fluid-couch-cleaner/tests/js/find-testDefs.json"],
    moduleName: "Node find tests...",
    cleanerOptions: {
        // TODO:  Figure this bit out, the data is not actually loaded by the time "onStarted" is fired.
        port: "{testEnvironment}.options.port"
        // port: 8459
    }
});

fluid.defaults("fluid.tests.couchCleaner.find.environment", {
    gradeNames: ["gpii.test.pouch.environment"],
    components: {
        harness: {
            type: "fluid.tests.couchCleaner.harness"
        },
        caseHolder: {
            type: "fluid.tests.couchCleaner.find.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.tests.couchCleaner.find.environment");
