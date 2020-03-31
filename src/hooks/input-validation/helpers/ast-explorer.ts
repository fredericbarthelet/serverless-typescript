import * as ts from 'typescript';

const getFirstArgumentType = (
  node: ts.FunctionDeclaration | ts.ArrowFunction,
): string | undefined => {
  const firstArgument = node.parameters[0];
  if (firstArgument?.type) {
    return firstArgument.type.getText();
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
      const initializer = node.initializer;
      if (ts.isArrowFunction(initializer)) {
        return getFirstArgumentType(initializer);
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
