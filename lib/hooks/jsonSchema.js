"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var lodash_1 = __importDefault(require("lodash"));
var typescript_json_schema_1 = require("typescript-json-schema");
var getHandlerFile = function (serverlessFunction) {
    var handler = serverlessFunction.handler;
    // Check if handler is a well-formed path based handler.
    var handlerEntry = /(.*)\..*?$/.exec(handler);
    if (handlerEntry) {
        return handlerEntry[1];
    }
};
exports.main = function (serverless) {
    var functions = serverless.service.getAllFunctions();
    var inputDefinitionFiles = [];
    var update = {};
    lodash_1.default.forEach(functions, function (func, index) {
        var entry = getHandlerFile(serverless.service.getFunction(func));
        var resolvedInputInterfaceFile = path_1.default.format({
            dir: serverless.config.servicePath,
            name: entry,
            ext: '.input.ts',
        });
        if (!fs_1.default.existsSync(resolvedInputInterfaceFile)) {
            return;
        }
        update[functions[index]] = {
            events: [
                {
                    http: {},
                },
            ],
        };
        serverless.cli.log("Found definition interface for function " + functions[index]);
        inputDefinitionFiles.push(resolvedInputInterfaceFile);
    });
    var compilerOptions = {
        skipLibCheck: true,
    };
    var program = typescript_json_schema_1.getProgramFromFiles(inputDefinitionFiles, compilerOptions);
    var generator = typescript_json_schema_1.buildGenerator(program);
    lodash_1.default.transform(update, function (_accumulator, _value, key, object) {
        object[key].events[0].http = {
            request: {
                schema: {
                    'application/json': generator.getSchemaForSymbol('TestData'),
                },
            },
        };
    });
    serverless.service.update({ functions: update });
};
