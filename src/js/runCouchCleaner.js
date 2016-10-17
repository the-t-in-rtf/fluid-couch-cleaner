/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var fs = require("fs");
var path = require("path");

var yargs = require("yargs");

fluid.registerNamespace("fluid.couchCleaner.runner");

require("./couchCleaner");

fluid.couchCleaner.runner.runWithArgs = function (that) {
    fluid.each(that.options.yargsOptions, function (fnArgs, fnName) {
        yargs[fnName].apply(yargs, fluid.makeArray(fnArgs));
    });

    var args = yargs.argv;

    var options = fluid.filterKeys(args, ["db", "find", "port", "hostname", "authCreds", "scheme", "replace"]);

    if (args.optionsFile) {
        var optionsFileOptions = fluid.couchCleaner.runner.loadFileOptions(args.optionsFile);
        options = fluid.merge(null, optionsFileOptions, options);
    }

    var couchCleaner = fluid.couchCleaner(options);
    couchCleaner.execute().then(that.handleResult);
};

fluid.couchCleaner.runner.loadFileOptions = function (filePath) {
    return require(path.resolve(__dirname, filePath));
};

fluid.couchCleaner.runner.handleResult = function (that, result) {
    if (that.options.outputFile) {
        var resolvedPath = fluid.module.resolvePath(that.options.outputFile);

        fs.writeFileSync(resolvedPath, result, "utf8");
    }
    else {
        fluid.log(JSON.stringify(result, null, 2));
    }
};

fluid.defaults("fluid.couchCleaner.runner", {
    gradeNames: ["fluid.component"],
    yargsOptions: {
        usage: "Usage $0 [options]",
        describe: {
            "scheme": "The scheme to use when connecting.  Defaults to `http`.",
            "hostname": "The hostname on which CouchDB is running.  Defaults to `localhost`",
            "port": "The port on which CouchDB is running. Defaults to `5984`. ",
            "db": "The CouchDB database we're working with. ",
            "authCreds": "The auth credentials (`username:password@`) to use when connecting.  You must include the trailing `@` symbol.  Empty by default.",
            "find": "A Mango query that will executed against CouchDB's _find interface. ",
            "replace": "Model Transformation Rules that should be used to update any matching records.",
            "optionsFile": "A file to load configuration options from.",
            "outputFile": "A file to save the output to."
        },
        demand: ["db", "find"],
        coerce: {
            "find": JSON.parse,
            "replace": JSON.parse,
            "fileOptions": fluid.couchCleaner.runner.loadFileOptions
        }
    },
    invokers: {
        handleResult: {
            funcName: "fluid.couchCleaner.runner.handleResult",
            args: ["{that}", "{arguments}.0"] // result
        }
    },
    listeners: {
        "onCreate.run": {
            funcName: "fluid.couchCleaner.runner.runWithArgs",
            args:     ["{that}"]
        }
    }
});

fluid.couchCleaner.runner();
