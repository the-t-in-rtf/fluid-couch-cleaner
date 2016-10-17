# Fluid Couch Cleaner

This package is designed to bulk find/replace data in a CouchDB (2.0 or higher) database.

# Using this package in your own code

This package provides a `fluid.couchCleaner` grade that you can use from within your own code.

## Component Options

| Option            | Type     | Description |
| ----------------- | -------- | ----------- |
| `protocol`        | `String` | The scheme to use when connecting.  Defaults to `http:`. |
| `hostname`        | `String` | The hostname on which CouchDB is running.  Defaults to `localhost`|
| `port`            | `String` | The port on which CouchDB is running. Defaults to `5984`. |
| `db` (required)   | `String` | The CouchDB database we're working with. |
| `authCreds`       | `String` | The auth credentials (`username:password@`) to use when connecting.  You must include the trailing `@` symbol.  Empty by default. |
| `find` (required) | `Object` | A Mango query that will executed against CouchDB's [`_find`](http://docs.couchdb.org/en/2.0.0/api/database/find.html#post--db-_find) interface. |
| `replace`         | `Object` | [Model Transformation Rules](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html) that should be used to update any matching records. |


## Component Invokers

### `{that}.execute()`

Perform a find.  If [Model Transformation rules](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html)
 are specified in `options.replace`, the original record will be replaced with a transformed version of itself, as
 in the following example, which replaces `null` values in a particular field with `undefined` (basically removing them):

 ```
 var myComponent = fluid.couchCleaner({
    find: { selector: { "manufacturer.name": null } },
    replace: {
        "": "",
        "manufacturer.name": { literalValue: undefined }
    }
 });

 myComponent.execute();

 ```


# Using this package from the command line.

This package also providse a command-line script that allows you to create an instance of fluid.couchCleaner and
have it perform its work based on the supplied options.  This script is executed using a command like:

```
node src/js/runCouchCleaner.js
```

From the command line, all of the top-level component options  above can be used from the command line.  If an option
requires an object, you should supply stringified JSON, as in:

```
node src/js/runCouchCleaner.js --url http://admin:admin@localhost:5984/db --find
```

The command-line options parsing is handled by [yargs](https://github.com/yargs/yargs), so we support all the
variations (single and double dashes, etc.) they do.

In addition to the above component options, the `runCouchCleaner.js` script also supports an `optionsFile` option,
which represents the path to a JSON file containing the options to use.