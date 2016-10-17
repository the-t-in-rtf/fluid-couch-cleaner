// The caseHolder used in the tests in this package.  Note:  You must require gpii-pouchdb and then run gpii.pouchdb.loadTestingSupport() to use this grade.
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var jqUnit = require("node-jqunit");

fluid.registerNamespace("fluid.tests.couchCleaner");

fluid.tests.couchCleaner.rehydrateAllTests = function (that) {
    var rehydratedTests = [];

    fluid.each(fluid.makeArray(that.options.testFiles), function (filename) {
        var fullPath = fluid.module.resolvePath(filename);
        var testData = require(fullPath);

        rehydratedTests = rehydratedTests.concat(fluid.transform(testData, that.rehydrateTest));
    });

    var allTests = [{
        name: that.options.moduleName,
        tests: rehydratedTests
    }];

    var testsWithRequiredSequences = gpii.test.express.helpers.addRequiredSequences(allTests, that.options.sequenceStart, that.options.sequenceEnd);
    return testsWithRequiredSequences;
};

/*
    A test rehydrator used to test the couchCleaner component itself.  We override this when testing the "runner".

 */
fluid.tests.couchCleaner.rehydrateSingleTest = function (that, testDef) {
    testDef.cleanerOptions = fluid.merge(null, that.options.cleanerOptions, testDef.cleanerOptions);

    return {
        name: testDef.name,
        type: "test",
        sequence: [{
            func: "fluid.tests.couchCleaner.runSingleTest",
            args: [testDef]
        }]
    };
};

/*

    TestDefs look something like:

    {
        name: "test something important...",
        cleanerOptions: {
            find:    { selector: { name: "foo" } },
            replace: { // transformation rules }
        },
        expectedOutput: {
            docs: [ { name: "foo" } ]
        }
    }

*/
fluid.tests.couchCleaner.runSingleTest = function (testDef) {
    var promise = fluid.couchCleaner(testDef.cleanerOptions).execute();
    promise.then(
        function (results) {
            jqUnit.assertLeftHand("The response (minus docs) should be as expected...", fluid.censorKeys(testDef.expectedOutput, "docs"), fluid.censorKeys(results, "docs"));

            jqUnit.assertEquals("The response should contain the expected number of documents...", testDef.expectedOutput.docs.length, results.docs.length);

            if (testDef.expectedOutput.docs.length === results.docs.length) {
                for (var docNumber = 0; docNumber < testDef.expectedOutput.docs.length; docNumber++) {
                    jqUnit.assertLeftHand("Document #" + docNumber + " should be as expected...", testDef.expectedOutput.docs[docNumber], results.docs[docNumber]);
                }
            }
        },
        function (error) {
            jqUnit.assertDeepEq("There should be no errors...", {}, error);
        }
    );

};

fluid.defaults("fluid.tests.couchCleaner.caseHolder", {
    gradeNames: ["gpii.test.pouch.caseHolder"],
    moduleSource: {
        funcName: "fluid.tests.couchCleaner.rehydrateAllTests",
        args:     ["{that}"]
    },
    invokers: {
        rehydrateTest: {
            funcName: "fluid.tests.couchCleaner.rehydrateSingleTest",
            args: ["{that}", "{arguments}.0"] // testDef
        }
    }

});
