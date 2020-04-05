"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = __importStar(require("typescript"));
var getFirstArgumentType = function (node) {
    var firstArgument = node.parameters[0];
    if (firstArgument === null || firstArgument === void 0 ? void 0 : firstArgument.type) {
        if (ts.isTypeReferenceNode(firstArgument.type)) {
            return firstArgument.type.typeArguments[0].getText();
        }
    }
};
var nodeVisitorFactory = function (targetFunctionName) {
    var nodeVisitor = function (node) {
        if (ts.isFunctionDeclaration(node) &&
            targetFunctionName === node.name.getText()) {
            return getFirstArgumentType(node);
        }
        if (ts.isVariableDeclaration(node) &&
            targetFunctionName === node.name.getText()) {
            var initializer = node.initializer;
            if (ts.isArrowFunction(initializer)) {
                return getFirstArgumentType(initializer);
            }
        }
        return node.forEachChild(nodeVisitor);
    };
    return nodeVisitor;
};
exports.getHandlerEventArgumentType = function (fileName, sourceCode, targetFunctionName) {
    var sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);
    var nodeVisitor = nodeVisitorFactory(targetFunctionName);
    return nodeVisitor(sourceFile);
};
