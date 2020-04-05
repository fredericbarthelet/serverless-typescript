"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var lodash_1 = __importDefault(require("lodash"));
var typescript_json_schema_1 = require("typescript-json-schema");
var ast_explorer_1 = require("./helpers/ast-explorer");
var serverless_function_definition_1 = require("./helpers/serverless-function-definition");
var HTTP_EVENT_NAME = 'http';
var getFunctionEventInterfaceName = function (func, serverless) {
    var _a = serverless_function_definition_1.getFunctionDefinitionInfos(serverless.service.getFunction(func)), filePath = _a.filePath, functionName = _a.functionName;
    var resolvedHandlerFile = path_1.default.format({
        dir: serverless.config.servicePath,
        name: filePath,
        ext: '.ts',
    });
    if (!fs_1.default.existsSync(resolvedHandlerFile)) {
        return;
    }
    var interfaceName = ast_explorer_1.getHandlerEventArgumentType(func, fs_1.default.readFileSync(resolvedHandlerFile, 'utf-8'), functionName);
    if (interfaceName) {
        serverless.cli.log("[Serverless-typescript] Found event interface " + interfaceName + " for function " + func);
    }
    return { interfaceName: interfaceName, resolvedHandlerFile: resolvedHandlerFile };
};
var getInterfaceDefinition = function (interfaceName, generator) {
    var schema = generator.getSchemaForSymbol(interfaceName);
    return schema;
};
exports.main = function (serverless) {
    var functions = serverless.service.getAllFunctions();
    var httpFunctions = lodash_1.default.filter(functions, function (func) {
        var events = serverless.service.getAllEventsInFunction(func);
        return lodash_1.default.some(events, function (event) {
            return HTTP_EVENT_NAME in event;
        });
    });
    var httpFunctionsWithInterfaces = [];
    var files = [];
    var functionEventInterfaceNames = lodash_1.default.chain(httpFunctions)
        .map(function (func) {
        var _a = getFunctionEventInterfaceName(func, serverless), functionEventInterfaceName = _a.interfaceName, resolvedHandlerFile = _a.resolvedHandlerFile;
        if (functionEventInterfaceName) {
            httpFunctionsWithInterfaces.push(func);
            files.push(resolvedHandlerFile);
        }
        return functionEventInterfaceName;
    })
        .compact()
        .value();
    // generator
    var compilerOptions = {
        skipLibCheck: true,
    };
    var program = typescript_json_schema_1.getProgramFromFiles(
    // @TODO list all project files to be able to retrieve interface definition whatever the location
    files, compilerOptions);
    var generator = typescript_json_schema_1.buildGenerator(program, { required: true });
    var functionEventInterfaceDefinitions = lodash_1.default.map(functionEventInterfaceNames, function (functionEventInterfaceName) {
        return getInterfaceDefinition(functionEventInterfaceName, generator);
    });
    var newFunctionDefinitions = lodash_1.default.reduce(httpFunctionsWithInterfaces, function (functionDefinitions, httpFunction, index) {
        functionDefinitions[httpFunction] = { events: [] };
        functionDefinitions[httpFunction].events = lodash_1.default.map(serverless.service.getAllEventsInFunction(httpFunction), function (event) {
            if (HTTP_EVENT_NAME in event) {
                event[HTTP_EVENT_NAME].request = {
                    schema: {
                        'application/json': functionEventInterfaceDefinitions[index],
                    },
                };
            }
            return event;
        });
        return functionDefinitions;
    }, {});
    serverless.service.update({ functions: newFunctionDefinitions });
};
