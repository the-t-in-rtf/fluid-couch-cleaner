// A test harness that wires up an instance of gpii.pouchdb.express with our sample data.
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("../../../");

require("gpii-pouchdb");

fluid.defaults("fluid.tests.couchCleaner.harness", {
    gradeNames: ["gpii.pouch.harness"],
    distributeOptions: [
        {
            source: "{that}.options.pouchConfig",
            target: "{that gpii.pouch.express.base}.options"
        }
    ],
    pouchConfig: {
        databases: {
            fruit: {
                data: "%fluid-couch-cleaner/tests/data/fruit.json"
            }
        }
    }
});
