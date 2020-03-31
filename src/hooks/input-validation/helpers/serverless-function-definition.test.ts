import { FunctionDefinition } from 'serverless';

import { getFunctionDefinitionInfos } from './serverless-function-definition';

describe('serverless function definition', () => {
  test('getFunctionDefinitionInfos', () => {
    const serverlessFunctionDefinition: FunctionDefinition = {
      name: 'function1',
      package: {
        include: [],
        exclude: [],
      },
      handler: 'path/to/my/function.handler',
    };
    expect(getFunctionDefinitionInfos(serverlessFunctionDefinition)).toEqual({
      filePath: 'path/to/my/function',
      functionName: 'handler',
    });

    const invalidServerlessFunctionDefinition: FunctionDefinition = {
      name: 'function1',
      package: {
        include: [],
        exclude: [],
      },
      handler: 'invalidHandler',
    };
    expect(
      getFunctionDefinitionInfos(invalidServerlessFunctionDefinition),
    ).toBe(undefined);
  });
});
