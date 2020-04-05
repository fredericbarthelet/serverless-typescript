import * as ts from 'typescript';

const getFirstArgumentType = (
  node: ts.FunctionDeclaration | ts.ArrowFunction,
): string | undefined => {
  const firstArgument = node.parameters[0];
  if (firstArgument?.type) {
    if (ts.isTypeReferenceNode(firstArgument.type)) {
      return firstArgument.type.typeArguments[0].getText();
    }
  }
};

const diveInCallExpression = (node: ts.Node): ts.ArrowFunction | undefined => {
  if (ts.isArrowFunction(node)) {
    return node;
  }
  if (ts.isCallExpression(node)) {
    return node.forEachChild(diveInCallExpression);
  }
};

const nodeVisitorFactory = (targetFunctionName: string) => {
  const nodeVisitor = (node: ts.Node): string => {
    if (
      ts.isFunctionDeclaration(node) &&
      targetFunctionName === node.name.getText()
    ) {
      return getFirstArgumentType(node);
    }

    if (
      ts.isVariableDeclaration(node) &&
      targetFunctionName === node.name.getText()
    ) {
      const arrowFunction = diveInCallExpression(node.initializer);
      if (arrowFunction) {
        return getFirstArgumentType(arrowFunction);
      }
    }

    return node.forEachChild(nodeVisitor);
  };

  return nodeVisitor;
};

export const getHandlerEventArgumentType = (
  fileName: string,
  sourceCode: string,
  targetFunctionName: string,
): string | undefined => {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );
  const nodeVisitor = nodeVisitorFactory(targetFunctionName);
  return nodeVisitor(sourceFile);
};
