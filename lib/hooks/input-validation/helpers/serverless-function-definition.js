"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HANDLER_REGEX = /(?<filePath>.*)\.(?<functionName>.*?)$/;
exports.getFunctionDefinitionInfos = function (serverlessFunction) {
    var matches = serverlessFunction.handler.match(HANDLER_REGEX);
    if (matches === null || matches === void 0 ? void 0 : matches.groups) {
        return {
            filePath: matches.groups.filePath,
            functionName: matches.groups.functionName,
        };
    }
};
