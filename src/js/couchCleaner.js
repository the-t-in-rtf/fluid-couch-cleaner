/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("kettle");

fluid.registerNamespace("fluid.couchCleaner");

fluid.couchCleaner.execute = function (that) {
    that.promise = fluid.promise();

    that.finder.set({}, that.options.find).then(that.processFindResponse);

    return that.promise;
};

fluid.couchCleaner.processFindResponse = function (that, couchResponse) {
    if (that.options.replace) {
        var updatedDocs = fluid.transform(couchResponse.docs, function (doc) {
            return fluid.model.transformWithRules(doc, that.options.replace);
        });

        that.replacer.set({}, { docs: updatedDocs }).then(that.processUpdateResponse);
    }
    else {
        that.promise.resolve(couchResponse);
    }
};

fluid.couchCleaner.processUpdateResponse = function (that, couchResponse) {
    that.promise.resolve(couchResponse);
};

fluid.couchCleaner.handleError = function (that, errorArgs) {
    that.promise.reject(errorArgs);
};

fluid.defaults("fluid.couchCleaner.dataSource", {
    gradeNames: ["kettle.dataSource.URL", "kettle.dataSource.URL.writable"],
    writeMethod: "POST",
    termMap: {},
    protocol: "{couchCleaner}.options.protocol",
    listeners: {
        "onError.reject": {
            funcName: "{fluid.couchCleaner}.handleError",
            args: ["{arguments}"]
        }
    }
});

fluid.defaults("fluid.couchCleaner", {
    gradeNames: ["fluid.component"],
    hostname: "localhost",
    port:     5984,
    protocol: "http:",
    authCreds: "",
    members: {
        promise: null
    },
    couchDbUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["%protocol//%authCreds%hostname:%port/%db", "{that}.options"]
        }
    },
    invokers: {
        execute: {
            funcName: "fluid.couchCleaner.execute",
            args:     ["{that}"]
        },
        handleError: {
            funcName: "fluid.couchCleaner.handleError",
            args: ["{that}", "{arguments}"]
        },
        processFindResponse: {
            funcName: "fluid.couchCleaner.processFindResponse",
            args:     ["{that}", "{arguments}.0"]
        },
        processUpdateResponse: {
            funcName: "fluid.couchCleaner.processUpdateResponse",
            args:     ["{that}", "{arguments}.0"]
        }
    },
    components: {
        finder: {
            type: "fluid.couchCleaner.dataSource",
            options: {
                url: {
                    expander: {
                        funcName: "fluid.stringTemplate",
                        args: ["%couchDbUrl/_find", "{couchCleaner}.options"]
                    }
                }
            }
        },
        replacer: {
            type: "fluid.couchCleaner.dataSource",
            options: {
                url: {
                    expander: {
                        funcName: "fluid.stringTemplate",
                        args: ["%couchDbUrl/_bulk_docs", "{couchCleaner}.options"]
                    }
                }
            }
        }
    }
});
