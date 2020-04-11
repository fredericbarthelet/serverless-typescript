import Serverless, { FunctionDefinition, Event } from 'serverless';
import path from 'path';
import fs from 'fs';

import _ from 'lodash';
import {
  getProgramFromFiles,
  buildGenerator,
  JsonSchemaGenerator,
} from 'typescript-json-schema';

import { getHandlerEventArgumentType } from './helpers/ast-explorer';
import { getFunctionDefinitionInfos } from './helpers/serverless-function-definition';

const HTTP_EVENT_NAME = 'http';

const getFunctionEventInterfaceName = (
  func: string,
  serverless: Serverless,
): { interfaceName: string; resolvedHandlerFile: string } | undefined => {
  const { filePath, functionName } = getFunctionDefinitionInfos(
    serverless.service.getFunction(func),
  );
  const resolvedHandlerFile = path.format({
    dir: serverless.config.servicePath,
    name: filePath,
    ext: '.ts',
  });

  if (!fs.existsSync(resolvedHandlerFile)) {
    return;
  }

  const interfaceName = getHandlerEventArgumentType(
    func,
    fs.readFileSync(resolvedHandlerFile, 'utf-8'),
    functionName,
  );
  if (interfaceName) {
    serverless.cli.log(
      `[Serverless-typescript] Found event interface ${interfaceName} for function ${func}`,
    );
  }

  return { interfaceName, resolvedHandlerFile };
};

const getInterfaceDefinition = (
  interfaceName: string,
  generator: JsonSchemaGenerator,
) => {
  const schema = generator.getSchemaForSymbol(interfaceName);
  return schema;
};

export const main = (serverless: Serverless) => {
  const functions = serverless.service.getAllFunctions();

  const httpFunctions = _.filter(functions, (func: string) => {
    const events = serverless.service.getAllEventsInFunction(func);
    return _.some(events, (event: any) => {
      if (HTTP_EVENT_NAME in event) {
        return event[HTTP_EVENT_NAME].integration === 'lambda-proxy'
      }
      return false;
    });
  });

  const httpFunctionsWithInterfaces: string[] = [];
  const files: string[] = [];
  const functionEventInterfaceNames = _.chain(httpFunctions)
    .map((func: string) => {
      const {
        interfaceName: functionEventInterfaceName,
        resolvedHandlerFile,
      } = getFunctionEventInterfaceName(func, serverless);
      if (functionEventInterfaceName) {
        httpFunctionsWithInterfaces.push(func);
        files.push(resolvedHandlerFile);
      }
      return functionEventInterfaceName;
    })
    .compact()
    .value();

  // generator
  const compilerOptions = {
    skipLibCheck: true,
  };
  const program = getProgramFromFiles(
    // @TODO list all project files to be able to retrieve interface definition whatever the location
    files,
    compilerOptions,
  );
  const generator = buildGenerator(program, { required: true });
  const functionEventInterfaceDefinitions = _.map(
    functionEventInterfaceNames,
    (functionEventInterfaceName: string) => {
      return getInterfaceDefinition(functionEventInterfaceName, generator);
    },
  );

  const newFunctionDefinitions = _.reduce(
    httpFunctionsWithInterfaces,
    (
      functionDefinitions: { [key: string]: { events: Event[] } },
      httpFunction: string,
      index: number,
    ) => {
      functionDefinitions[httpFunction] = { events: [] };
      functionDefinitions[httpFunction].events = _.map(
        serverless.service.getAllEventsInFunction(httpFunction),
        (event: any) => {
          if (HTTP_EVENT_NAME in event) {
            event[HTTP_EVENT_NAME].request = {
              schema: {
                'application/json': functionEventInterfaceDefinitions[index],
              },
            };
          }
          return event;
        },
      );
      return functionDefinitions;
    },
    {},
  );

  serverless.service.update({ functions: newFunctionDefinitions });
};
