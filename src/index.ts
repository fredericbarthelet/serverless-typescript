import Serverless, { Options } from 'serverless';
import { main } from './hooks/jsonSchema';

class ServerlessTypescript {
  private serverless: Serverless;
  private options: Options;

  constructor(serverless: Serverless, options: Options) {
    this.serverless = serverless;
    this.options = options;
  }

  hooks = {
    'before:package:createDeploymentArtifacts': () => {
      main(this.serverless);
    },
  };
}

export = ServerlessTypescript;
