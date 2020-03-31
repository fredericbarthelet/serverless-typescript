import { FunctionDefinition } from 'serverless';
import { match } from 'assert';

const HANDLER_REGEX = /(?<filePath>.*)\.(?<functionName>.*?)$/;

interface FunctionDefinitionInfos {
  filePath: string;
  functionName: string;
}

export const getFunctionDefinitionInfos = (
  serverlessFunction: FunctionDefinition,
): FunctionDefinitionInfos | undefined => {
  const matches = serverlessFunction.handler.match(HANDLER_REGEX);
  if (matches?.groups) {
    return {
      filePath: matches.groups.filePath,
      functionName: matches.groups.functionName,
    };
  }
};
