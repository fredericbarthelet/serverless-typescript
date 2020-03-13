import Serverless, { FunctionDefinition } from "serverless";
import path from 'path';
import fs from 'fs';
import _ from 'lodash';

import { getProgramFromFiles, buildGenerator } from 'typescript-json-schema';

const getHandlerFile = (serverlessFunction: FunctionDefinition) => {
        const handler = serverlessFunction.handler;
        // Check if handler is a well-formed path based handler.
        const handlerEntry = /(.*)\..*?$/.exec(handler);
        if (handlerEntry) {
          return handlerEntry[1];
        }
      }

export const main = (serverless: Serverless) => {
    const functions = serverless.service.getAllFunctions();
    const inputDefinitionFiles: string[] = [];
    const update: { [key: string]: { events: { http: object}[]}} = {};
    _.forEach(functions, (func: string, index: number) => {
      const entry = getHandlerFile(serverless.service.getFunction(func));
      const resolvedInputInterfaceFile = path.format({
        dir: serverless.config.servicePath,
        name: entry,
        ext: '.input.ts',
      });
      if (!fs.existsSync(resolvedInputInterfaceFile)) {
        return;
      }
      update[functions[index]] = {
        events: [
          {
            http: {}
          }
        ]
      };
      serverless.cli.log(`Found definition interface for function ${functions[index]}`);
      inputDefinitionFiles.push(resolvedInputInterfaceFile);
    });
    const compilerOptions = {
      skipLibCheck: true
    };
    const program = getProgramFromFiles(inputDefinitionFiles, compilerOptions);
    const generator = buildGenerator(program);
    _.transform(update, (_accumulator, _value, key, object) => {
      object[key].events[0].http = {
        request: {
          schema: {
            'application/json': generator.getSchemaForSymbol('TestData'),
          }
        }
      }
    });
    serverless.service.update({ functions: update });
}