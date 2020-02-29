'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require ('fs');
const TJS = require ('typescript-json-schema');

class ServerlessTypescript {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {};

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.test.bind(this),
    };
  }

  getHandlerFile = serverlessFunction => {
    const handler = serverlessFunction.handler;
    // Check if handler is a well-formed path based handler.
    const handlerEntry = /(.*)\..*?$/.exec(handler);
    if (handlerEntry) {
      return handlerEntry[1];
    }
  }

  test() {
    const functions = this.serverless.service.getAllFunctions();
    const inputDefinitionFiles = [];
    const update = {};
    _.forEach(functions, (func, index) => {
      const entry = this.getHandlerFile(this.serverless.service.getFunction(func));
      const resolvedInputInterfaceFile = path.format({
        dir: this.serverless.config.servicePath,
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
      this.serverless.cli.log(`Found definition interface for function ${functions[index]}`);
      inputDefinitionFiles.push(resolvedInputInterfaceFile);
    });
    const compilerOptions = {
      skipLibCheck: true
    };
    const program = TJS.getProgramFromFiles(inputDefinitionFiles, compilerOptions);
    const generator = TJS.buildGenerator(program);
    _.transform(update,  (accumulator, value, key, object) => {
      object[key].events[0].http = {
        request: {
          schema: {
            'application/json': generator.getSchemaForSymbol('TestData'),
          }
        }
      }
    });
    this.serverless.service.update({ functions: update });
  }
}

module.exports = ServerlessTypescript;
