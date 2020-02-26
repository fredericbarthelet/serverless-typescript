'use strict';

class ServerlessTypescript {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {};

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.test.bind(this),
    };
  }

  test() {
    this.serverless.cli.log('This is my test string !!!!!!!!!!!!!!');
  }
}

module.exports = ServerlessTypescript;
