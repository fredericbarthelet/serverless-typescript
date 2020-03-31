import Serverless, { Options } from 'serverless';
import { inputValidation } from './hooks';

class ServerlessTypescript {
  private serverless: Serverless;
  private options: Options;

  constructor(serverless: Serverless, options: Options) {
    this.serverless = serverless;
    this.options = options;
  }

  hooks = {
    'before:package:createDeploymentArtifacts': () => {
      inputValidation(this.serverless);
    },
  };
}

export = ServerlessTypescript;
